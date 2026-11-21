-- KindHop 0008 · 2026-11-21 · negocios locales vs cadenas (KH-020, ángulo "gasto local"). Solo añade.
-- Dato de OpenStreetMap: las cadenas llevan la etiqueta brand / brand:wikidata.
--   is_chain TRUE  → OSM registra una marca de cadena (brand guarda cuál).
--   is_chain FALSE → sin marca de cadena registrada en OSM: independiente según OSM (no es una prueba absoluta;
--                    por eso la alternativa "local" del motor tiene confianza MEDIUM, nunca HIGH).
--   is_chain NULL  → no aplica o no se sabe (lugares DEMO, playas, parques…).
ALTER TABLE places ADD COLUMN IF NOT EXISTS brand TEXT CHECK (char_length(brand) <= 120);
ALTER TABLE places ADD COLUMN IF NOT EXISTS is_chain BOOLEAN;
CREATE INDEX IF NOT EXISTS places_local_idx ON places (city_id, category, is_chain);
