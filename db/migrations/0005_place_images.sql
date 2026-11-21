-- Fotos genéricas locales para lugares (places) para que ninguna tarjeta o ficha quede sin imagen.
ALTER TABLE places
  ADD COLUMN IF NOT EXISTS image_url TEXT;

UPDATE places
SET image_url = CASE category
  WHEN 'markets' THEN '/demo/events/night-market.jpg'
  WHEN 'beaches' THEN '/demo/events/concert.jpg'
  WHEN 'museums' THEN '/demo/events/ceramics.jpg'
  WHEN 'culture' THEN '/demo/events/ceramics.jpg'
  WHEN 'art' THEN '/demo/events/ceramics.jpg'
  ELSE '/demo/events/food.jpg'
END
WHERE image_url IS NULL;
