-- Datos DEMO para la demo del hackatón. Siempre data_status = 'DEMO' y source_id = 'kindhop-demo'.
-- Reejecutable: borra y regenera lo DEMO con fechas relativas a now(), así nunca caduca. Nunca toca datos REAL.
-- Lugares: sitios públicos conocidos con coordenadas APROXIMADAS (las reales llegan con la importación OSM, KH-004).

DELETE FROM events WHERE source_id = 'kindhop-demo';
DELETE FROM urban_reports WHERE data_status = 'DEMO';

INSERT INTO places (city_id, source_id, external_id, name, category, lat, lon, is_free, data_status, i18n) VALUES
  ('cancun', 'kindhop-demo', 'cun-palapas', 'Parque de las Palapas', 'parks', 21.1617, -86.8265, true, 'DEMO', '{}'),
  ('cancun', 'kindhop-demo', 'cun-mercado-28', 'Mercado 28', 'markets', 21.1636, -86.8318, true, 'DEMO', '{"en": {"name": "Market 28"}}'),
  ('cancun', 'kindhop-demo', 'cun-museo-maya', 'Museo Maya de Cancún', 'museums', 21.0798, -86.7739, false, 'DEMO', '{"en": {"name": "Cancún Maya Museum"}}'),
  ('cancun', 'kindhop-demo', 'cun-playa-delfines', 'Playa Delfines', 'beaches', 21.0596, -86.7804, true, 'DEMO', '{"en": {"name": "Delfines Beach"}}'),
  ('cancun', 'kindhop-demo', 'cun-casa-cultura', 'Casa de la Cultura de Cancún', 'culture', 21.1527, -86.8494, NULL, 'DEMO', '{"en": {"name": "Cancún House of Culture"}}'),
  ('cdmx', 'kindhop-demo', 'cdmx-zocalo', 'Zócalo', 'culture', 19.4326, -99.1332, true, 'DEMO', '{}'),
  ('cdmx', 'kindhop-demo', 'cdmx-bellas-artes', 'Palacio de Bellas Artes', 'art', 19.4352, -99.1412, false, 'DEMO', '{"en": {"name": "Palace of Fine Arts"}}'),
  ('cdmx', 'kindhop-demo', 'cdmx-antropologia', 'Museo Nacional de Antropología', 'museums', 19.4260, -99.1863, false, 'DEMO', '{"en": {"name": "National Museum of Anthropology"}}'),
  ('cdmx', 'kindhop-demo', 'cdmx-chapultepec', 'Bosque de Chapultepec', 'parks', 19.4204, -99.1819, true, 'DEMO', '{"en": {"name": "Chapultepec Forest"}}'),
  ('cdmx', 'kindhop-demo', 'cdmx-mercado-coyoacan', 'Mercado de Coyoacán', 'markets', 19.3500, -99.1620, true, 'DEMO', '{"en": {"name": "Coyoacán Market"}}')
ON CONFLICT (source_id, external_id) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category, lat = EXCLUDED.lat,
  lon = EXCLUDED.lon, is_free = EXCLUDED.is_free, i18n = EXCLUDED.i18n;

-- Eventos DEMO: Cancún con fotos en public/demo/events; CDMX sin imagen (la API omite image en el contrato).
-- Hora local de la ciudad. Si el fin ya pasó en la zona de la ciudad, se suma un día (re-seed tarde en la noche).
WITH today AS (SELECT (now() AT TIME ZONE 'America/Cancun')::date AS cun, (now() AT TIME ZONE 'America/Mexico_City')::date AS mx),
raw AS (
  SELECT e.*, c.timezone,
         CASE e.city_id WHEN 'cancun' THEN today.cun ELSE today.mx END AS local_day
  FROM today, (VALUES
  ('cancun', 'concert', 'Concierto en Las Palapas', 'Parque Las Palapas', 'music', 'cun-palapas', 0, time '20:00', time '23:00', true,
   '/demo/events/concert.jpg', 'Czardelarua', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/', 'https://commons.wikimedia.org/wiki/File:Evento_Parque_Palapas_Cancun.JPG',
   '{"en": {"title": "Concert at Las Palapas"}}'),
  ('cancun', 'night-market', 'Mercado nocturno', 'Parque Las Palapas', 'food', 'cun-palapas', 1, time '18:00', time '23:00', true,
   '/demo/events/night-market.jpg', 'Samantha RV', 'CC0', 'https://creativecommons.org/publicdomain/zero/1.0/', 'https://commons.wikimedia.org/wiki/File:Tianguis_de_la_Puri_por_la_noche.jpg',
   '{"en": {"title": "Night market"}}'),
  ('cancun', 'ceramics', 'Taller de cerámica', 'Casa de la Cultura', 'art', 'cun-casa-cultura', 2, time '11:00', time '13:00', NULL,
   '/demo/events/ceramics.jpg', 'Tahirceylan', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/', 'https://commons.wikimedia.org/wiki/File:Pottery_Master.jpg',
   '{"en": {"title": "Pottery workshop"}}'),
  ('cancun', 'food-trail', 'Ruta de antojitos', 'Centro de Cancún', 'food', NULL, 4, time '19:00', time '22:00', NULL,
   '/demo/events/food.jpg', 'City Foodsters', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0/', 'https://commons.wikimedia.org/wiki/File:Parque_de_las_Palapas_1.jpg',
   '{"en": {"title": "Street food trail", "venue": "Downtown Cancún"}}'),
  ('cdmx', 'zocalo-concert', 'Concierto en el Zócalo', 'Zócalo', 'music', 'cdmx-zocalo', 1, time '19:00', time '22:00', true,
   NULL, NULL, NULL, NULL, NULL, '{"en": {"title": "Concert at the Zócalo"}}'),
  ('cdmx', 'coyoacan-market', 'Noche de mercado en Coyoacán', 'Mercado de Coyoacán', 'markets', 'cdmx-mercado-coyoacan', 2, time '18:00', time '22:00', true,
   NULL, NULL, NULL, NULL, NULL, '{"en": {"title": "Coyoacán market night"}}'),
  ('cdmx', 'museum-tour', 'Recorrido guiado de antropología', 'Museo Nacional de Antropología', 'culture', 'cdmx-antropologia', 3, time '10:00', time '12:00', false,
   NULL, NULL, NULL, NULL, NULL, '{"en": {"title": "Anthropology guided tour"}}')
  ) AS e(city_id, external_id, title, venue, category, place_ext, plus_days, starts, ends, is_free,
         image_url, image_author, image_license, image_license_url, image_source_url, i18n)
  JOIN cities c ON c.id = e.city_id
),
shifted AS (
  SELECT raw.*,
         raw.plus_days + CASE
           WHEN ((raw.local_day + raw.plus_days + raw.ends)::timestamp AT TIME ZONE raw.timezone) <= now() THEN 1
           ELSE 0
         END AS adj_days
  FROM raw
)
INSERT INTO events (city_id, source_id, external_id, title, venue_name, category, place_id, starts_at, ends_at, is_free, data_status,
                    image_url, image_author, image_license, image_license_url, image_source_url, i18n)
SELECT shifted.city_id, 'kindhop-demo', shifted.external_id, shifted.title, shifted.venue, shifted.category,
       (SELECT id FROM places WHERE source_id = 'kindhop-demo' AND external_id = shifted.place_ext),
       ((shifted.local_day + shifted.adj_days)::date + shifted.starts)::timestamp AT TIME ZONE shifted.timezone,
       ((shifted.local_day + shifted.adj_days)::date + shifted.ends)::timestamp AT TIME ZONE shifted.timezone,
       shifted.is_free, 'DEMO', shifted.image_url, shifted.image_author, shifted.image_license, shifted.image_license_url,
       shifted.image_source_url, shifted.i18n::jsonb
FROM shifted;

-- Incidencias DEMO para el pitch (coordenadas redondeadas a 3 decimales, caducan en 6 h).
INSERT INTO urban_reports (city_id, lat, lon, kind, description, status, data_status, created_at, expires_at, confirm_count) VALUES
  ('cancun', 21.161, -86.827, 'PUDDLE', 'Encharcamiento junto al parque (ejemplo)', 'UNVERIFIED', 'DEMO', now() - interval '20 minutes', now() + interval '6 hours', 0),
  ('cancun', 21.155, -86.840, 'FLOOD', 'Calle inundada tras la lluvia (ejemplo)', 'CONFIRMED', 'DEMO', now() - interval '1 hour', now() + interval '5 hours', 3),
  ('cdmx', 19.433, -99.133, 'PUDDLE', 'Charco grande en el cruce (ejemplo)', 'UNVERIFIED', 'DEMO', now() - interval '10 minutes', now() + interval '6 hours', 0);
