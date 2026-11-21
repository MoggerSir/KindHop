-- Asigna fotos variadas por categoría en `places` (sin repetir la misma imagen en tarjetas consecutivas ni usar la foto del helado).
WITH ranked AS (
  SELECT id, category, ROW_NUMBER() OVER (PARTITION BY category ORDER BY name, id) - 1 AS idx
  FROM places
)
UPDATE places p
SET image_url = CASE r.category
  WHEN 'markets' THEN (ARRAY['/demo/places/market-1.jpg', '/demo/places/market-2.jpg', '/demo/events/night-market.jpg', '/demo/events/ceramics.jpg'])[(r.idx % 4) + 1]
  WHEN 'beaches' THEN (ARRAY['/demo/places/beach-1.jpg', '/demo/places/beach-2.jpg'])[(r.idx % 2) + 1]
  WHEN 'museums' THEN (ARRAY['/demo/places/museum-1.jpg', '/demo/events/ceramics.jpg'])[(r.idx % 2) + 1]
  WHEN 'culture' THEN (ARRAY['/demo/places/museum-1.jpg', '/demo/events/ceramics.jpg'])[(r.idx % 2) + 1]
  WHEN 'art' THEN (ARRAY['/demo/events/ceramics.jpg', '/demo/places/museum-1.jpg'])[(r.idx % 2) + 1]
  ELSE (ARRAY['/demo/places/park-1.jpg', '/demo/places/beach-2.jpg', '/demo/places/market-2.jpg', '/demo/places/museum-1.jpg'])[(r.idx % 4) + 1]
END
FROM ranked r
WHERE p.id = r.id;
