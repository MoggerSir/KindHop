-- Patrocinios DEMO (KH-021): los 3 puestos pagados de eventos por ciudad. Eventos y patrocinios son simulados.
-- Repetible: limpia y vuelve a asignar.
UPDATE events SET sponsored_rank = NULL WHERE sponsored_rank IS NOT NULL;
UPDATE events SET sponsored_rank = v.rank
FROM (VALUES
  ('cancun', 'sunset-jazz', 1), ('cancun', 'craft-fair', 2), ('cancun', 'beach-cinema', 3),
  ('cdmx', 'zocalo-concert', 1), ('cdmx', 'coyoacan-market', 2), ('cdmx', 'museum-tour', 3)
) AS v(city_id, external_id, rank)
WHERE events.source_id = 'kindhop-demo' AND events.city_id = v.city_id AND events.external_id = v.external_id;
