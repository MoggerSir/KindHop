-- Calificaciones opcionales (0.0 a 5.0) y número de reseñas para lugares y eventos.
-- NULL significa que la fuente no publica calificación; nunca se inventan calificaciones sobre datos REAL.

ALTER TABLE places
  ADD COLUMN IF NOT EXISTS rating NUMERIC(2, 1) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  ADD COLUMN IF NOT EXISTS rating_count INTEGER CHECK (rating_count IS NULL OR rating_count >= 0);

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS rating NUMERIC(2, 1) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  ADD COLUMN IF NOT EXISTS rating_count INTEGER CHECK (rating_count IS NULL OR rating_count >= 0);
