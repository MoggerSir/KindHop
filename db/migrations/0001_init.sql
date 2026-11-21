-- KindHop 0001 · 2026-11-20 · esquema inicial. Se aplica con: npm run db:migrate
-- Estados de dato: REAL | DEMO | USER_REPORTED | UNVERIFIED (ver docs/06-data/data-policy.md).

CREATE TABLE IF NOT EXISTS cities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  center_lat DOUBLE PRECISION NOT NULL,
  center_lon DOUBLE PRECISION NOT NULL
);

INSERT INTO cities (id, name, country_code, center_lat, center_lon) VALUES
  ('cancun', 'Cancún', 'MX', 21.1619, -86.8515),
  ('cdmx', 'Ciudad de México', 'MX', 19.4326, -99.1332)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS places (
  id BIGSERIAL PRIMARY KEY,
  city_id TEXT NOT NULL REFERENCES cities(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT,
  license TEXT,
  data_status TEXT NOT NULL DEFAULT 'UNVERIFIED'
    CHECK (data_status IN ('REAL', 'DEMO', 'USER_REPORTED', 'UNVERIFIED')),
  retrieved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS places_city_idx ON places (city_id, category);

CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  city_id TEXT NOT NULL REFERENCES cities(id),
  title TEXT NOT NULL,
  venue_name TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  source_url TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  data_status TEXT NOT NULL DEFAULT 'UNVERIFIED'
    CHECK (data_status IN ('REAL', 'DEMO', 'UNVERIFIED'))
);
CREATE INDEX IF NOT EXISTS events_city_start_idx ON events (city_id, starts_at);

CREATE TABLE IF NOT EXISTS urban_reports (
  id BIGSERIAL PRIMARY KEY,
  city_id TEXT NOT NULL REFERENCES cities(id),
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('FLOOD', 'PUDDLE')),
  description TEXT CHECK (char_length(description) <= 500),
  status TEXT NOT NULL DEFAULT 'UNVERIFIED'
    CHECK (status IN ('UNVERIFIED', 'CONFIRMED', 'RESOLVED', 'REJECTED')),
  data_status TEXT NOT NULL DEFAULT 'USER_REPORTED'
    CHECK (data_status IN ('DEMO', 'USER_REPORTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  CHECK (expires_at > created_at)
);
CREATE INDEX IF NOT EXISTS urban_reports_active_idx ON urban_reports (city_id, expires_at);

-- Presupuesto/gastos: diferido hasta decidir identidad (OPEN-QUESTIONS #5). MVP: local-first en el navegador.
