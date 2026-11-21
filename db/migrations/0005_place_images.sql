-- Foto de un lugar (ADR-0008). Reejecutable y sin pisar datos: solo añade columnas.
-- image_url: ruta local o URL de la foto; image_data_status dice si es una foto REAL de ESE lugar (con fuente) o una
-- foto genérica e ilustrativa (DEMO). La web muestra la etiqueta DEMO sobre toda foto DEMO.
-- Los lugares OSM REAL no guardan foto: la API les asigna una genérica DEMO al responder (discovery.db.ts), así una
-- reimportación OSM (fetch-osm-pois.mjs no toca estas columnas) nunca las borra ni choca con ellas.
ALTER TABLE places
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS image_data_status TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'places_image_data_status_check') THEN
    ALTER TABLE places ADD CONSTRAINT places_image_data_status_check
      CHECK (image_data_status IS NULL OR image_data_status IN ('REAL', 'DEMO'));
  END IF;
END $$;
