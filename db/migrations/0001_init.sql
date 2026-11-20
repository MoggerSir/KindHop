-- KindHop, bootstrap 2026-11-20. Aplicar manualmente en desarrollo.
CREATE TABLE IF NOT EXISTS cities (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 country_code CHAR(2) NOT NULL,
 center_lat DOUBLE PRECISION NOT NULL,
 center_lon DOUBLE PRECISION NOT NULL
);
CREATE TABLE IF NOT EXISTS places (
 id BIGSERIAL PRIMARY KEY,
 city_id TEXT NOT NULL REFERENCES cities(id),
 name TEXT NOT NULL,
 category TEXT NOT NULL,
 lat DOUBLE PRECISION NOT NULL,
 lon DOUBLE PRECISION NOT NULL,
 source_name TEXT NOT NULL,
 source_url TEXT,
 data_status TEXT NOT NULL DEFAULT 'UNVERIFIED',
 fetched_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS events (
 id BIGSERIAL PRIMARY KEY,
 city_id TEXT NOT NULL REFERENCES cities(id),
 title TEXT NOT NULL,
 venue_name TEXT,
 starts_at TIMESTAMPTZ NOT NULL,
 ends_at TIMESTAMPTZ,
 source_url TEXT,
 verified_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS urban_reports (
 id BIGSERIAL PRIMARY KEY,
 city_id TEXT NOT NULL REFERENCES cities(id),
 lat DOUBLE PRECISION NOT NULL,
 lon DOUBLE PRECISION NOT NULL,
 kind TEXT NOT NULL,
 description TEXT,
 status TEXT NOT NULL DEFAULT 'unverified',
 data_status TEXT NOT NULL DEFAULT 'USER_REPORTED',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 expires_at TIMESTAMPTZ NOT NULL
);
-- Budget/expenses tables deferred until identity/privacy decision documented.
