-- KindHop 0002 · 2026-11-20 · esquema completo del MVP. Diccionario: docs/06-data/database.md
-- Solo añade (0001 ya está fusionada y no se edita). Sin PostGIS: puntos en lat/lon, geometrías GeoJSON en JSONB.
-- Textos de interfaz (nombres de categorías) viven en la web (i18n); aquí solo ids.

-- Ciudades: lo que la web necesita para pintar el mapa.
ALTER TABLE cities ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS default_zoom REAL;
UPDATE cities SET timezone = 'America/Cancun', default_zoom = 12 WHERE id = 'cancun';
UPDATE cities SET timezone = 'America/Mexico_City', default_zoom = 11 WHERE id = 'cdmx';
ALTER TABLE cities ALTER COLUMN timezone SET NOT NULL;
ALTER TABLE cities ALTER COLUMN default_zoom SET NOT NULL;

-- Procedencia: una fila por fuente; todo dato apunta a su fuente (nombre, licencia, estado, fecha).
CREATE TABLE IF NOT EXISTS data_sources (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-z0-9-]{2,64}$'),
  name TEXT NOT NULL,
  url TEXT,
  license TEXT NOT NULL,
  attribution TEXT,
  data_status TEXT NOT NULL CHECK (data_status IN ('REAL', 'DEMO', 'USER_REPORTED', 'UNVERIFIED')),
  retrieved_at TIMESTAMPTZ,
  notes TEXT
);

-- Categorías compartidas por lugares y eventos (las etiquetas visibles están en es.json / en.json).
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-z][a-z0-9_]{1,31}$'),
  applies_to TEXT[] NOT NULL CHECK (applies_to <@ ARRAY['place', 'event']::TEXT[] AND cardinality(applies_to) > 0),
  sort_order SMALLINT NOT NULL DEFAULT 0
);

-- Zonas (supermanzanas, alcaldías). bbox = [minLon, minLat, maxLon, maxLat] para filtrar sin PostGIS.
CREATE TABLE IF NOT EXISTS districts (
  id BIGSERIAL PRIMARY KEY,
  city_id TEXT NOT NULL REFERENCES cities(id),
  source_id TEXT NOT NULL REFERENCES data_sources(id),
  external_id TEXT,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('SUPERMANZANA', 'ALCALDIA', 'COLONIA', 'OTHER')),
  geometry JSONB NOT NULL CHECK (geometry->>'type' IN ('Polygon', 'MultiPolygon')),
  bbox DOUBLE PRECISION[] CHECK (cardinality(bbox) = 4),
  UNIQUE (source_id, external_id)
);
CREATE INDEX IF NOT EXISTS districts_city_idx ON districts (city_id);

-- Lugares (POI). La procedencia pasa a data_sources; source_name/source_url/license de 0001 quedan como legado opcional.
ALTER TABLE places ADD COLUMN IF NOT EXISTS source_id TEXT REFERENCES data_sources(id);
ALTER TABLE places ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE places ADD COLUMN IF NOT EXISTS district_id BIGINT REFERENCES districts(id);
ALTER TABLE places ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE places ADD COLUMN IF NOT EXISTS is_free BOOLEAN; -- NULL = no se sabe; el motor de decisiones no lo asume
ALTER TABLE places ADD COLUMN IF NOT EXISTS i18n JSONB NOT NULL DEFAULT '{}'::JSONB; -- {"en": {"name": "…"}}
ALTER TABLE places ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE places ALTER COLUMN source_name DROP NOT NULL;
ALTER TABLE places ADD CONSTRAINT places_category_fk FOREIGN KEY (category) REFERENCES categories(id);
ALTER TABLE places ADD CONSTRAINT places_source_external_uq UNIQUE (source_id, external_id);
ALTER TABLE places ADD CONSTRAINT places_coords_ck CHECK (lat BETWEEN -90 AND 90 AND lon BETWEEN -180 AND 180);
CREATE INDEX IF NOT EXISTS places_city_coords_idx ON places (city_id, lat, lon);

-- Eventos. Sin fuente solo si son DEMO; imagen con crédito obligatorio si hay imagen.
ALTER TABLE events ADD COLUMN IF NOT EXISTS category TEXT REFERENCES categories(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS place_id BIGINT REFERENCES places(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS source_id TEXT REFERENCES data_sources(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_free BOOLEAN;
ALTER TABLE events ADD COLUMN IF NOT EXISTS price_from_cents BIGINT CHECK (price_from_cents >= 0);
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_author TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_license TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_license_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_source_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS i18n JSONB NOT NULL DEFAULT '{}'::JSONB; -- {"en": {"title": "…", "venue": "…", "imageAlt": "…"}}
ALTER TABLE events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE events ALTER COLUMN source_url DROP NOT NULL;
ALTER TABLE events ADD CONSTRAINT events_source_required_ck CHECK (data_status = 'DEMO' OR source_url IS NOT NULL);
ALTER TABLE events ADD CONSTRAINT events_image_credit_ck CHECK (image_url IS NULL OR (image_author IS NOT NULL AND image_license IS NOT NULL AND image_source_url IS NOT NULL));
ALTER TABLE events ADD CONSTRAINT events_dates_ck CHECK (ends_at IS NULL OR ends_at > starts_at);
ALTER TABLE events ADD CONSTRAINT events_source_external_uq UNIQUE (source_id, external_id);

-- Transporte: snapshot de fuentes con licencia (GTFS CDMX) o caché del adaptador de Cancún. Nunca rutas inventadas.
CREATE TABLE IF NOT EXISTS transit_routes (
  id BIGSERIAL PRIMARY KEY,
  city_id TEXT NOT NULL REFERENCES cities(id),
  source_id TEXT NOT NULL REFERENCES data_sources(id),
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('bus', 'brt', 'metro', 'other')),
  color TEXT CHECK (color ~ '^#[0-9a-fA-F]{6}$'),
  geometry JSONB NOT NULL CHECK (geometry->>'type' IN ('LineString', 'MultiLineString')),
  fare_cents BIGINT CHECK (fare_cents >= 0), -- solo si la fuente la publica
  UNIQUE (source_id, external_id)
);
CREATE INDEX IF NOT EXISTS transit_routes_city_idx ON transit_routes (city_id);

CREATE TABLE IF NOT EXISTS transit_stops (
  id BIGSERIAL PRIMARY KEY,
  city_id TEXT NOT NULL REFERENCES cities(id),
  source_id TEXT NOT NULL REFERENCES data_sources(id),
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lon DOUBLE PRECISION NOT NULL CHECK (lon BETWEEN -180 AND 180),
  UNIQUE (source_id, external_id)
);
CREATE INDEX IF NOT EXISTS transit_stops_city_coords_idx ON transit_stops (city_id, lat, lon);

CREATE TABLE IF NOT EXISTS transit_route_stops (
  route_id BIGINT NOT NULL REFERENCES transit_routes(id) ON DELETE CASCADE,
  stop_id BIGINT NOT NULL REFERENCES transit_stops(id) ON DELETE CASCADE,
  sequence SMALLINT NOT NULL CHECK (sequence >= 0),
  PRIMARY KEY (route_id, sequence)
);

-- Incidencias: moderación y confirmaciones (sin cuenta ni IP guardada).
ALTER TABLE urban_reports ADD COLUMN IF NOT EXISTS confirm_count INTEGER NOT NULL DEFAULT 0 CHECK (confirm_count >= 0);
ALTER TABLE urban_reports ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;
ALTER TABLE urban_reports ADD COLUMN IF NOT EXISTS moderation_note TEXT CHECK (char_length(moderation_note) <= 280);
ALTER TABLE urban_reports ADD CONSTRAINT urban_reports_coords_ck CHECK (lat BETWEEN -90 AND 90 AND lon BETWEEN -180 AND 180);

-- Presupuesto: sin tablas a propósito (local-first en el navegador, OPEN-QUESTIONS #5 / docs/02-modules/budget.md).
