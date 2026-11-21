-- Fotos genéricas: nunca se escriben sobre lugares REAL (ADR-0008). Reejecutable.
-- Si una versión previa de 0005/0006 (rama de #32) rellenó image_url con fotos genéricas de public/demo/ sin estado,
-- se limpian aquí: la foto genérica DEMO la asigna la API al responder. Fotos con estado (REAL o DEMO) no se tocan.
UPDATE places
SET image_url = NULL
WHERE image_data_status IS NULL
  AND image_url LIKE '/demo/%';

-- Desde aquí toda foto guardada declara su estado.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'places_image_pair_check') THEN
    ALTER TABLE places ADD CONSTRAINT places_image_pair_check
      CHECK ((image_url IS NULL) = (image_data_status IS NULL));
  END IF;
END $$;
