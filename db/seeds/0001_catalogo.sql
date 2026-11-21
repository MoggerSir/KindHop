-- Catálogo base: fuentes y categorías. Idempotente (upsert). Se aplica con: npm run db:seed
INSERT INTO data_sources (id, name, url, license, attribution, data_status, notes) VALUES
  ('kindhop-demo', 'Datos simulados de KindHop', NULL, 'Propios del proyecto', 'Ejemplo: no son datos reales', 'DEMO',
   'Todo lo que apunta aquí se muestra con la etiqueta DEMO y lo regeneran los seeds.'),
  ('osm', 'OpenStreetMap vía Overpass', 'https://www.openstreetmap.org/copyright', 'ODbL 1.0', '© OpenStreetMap contributors', 'REAL',
   'Snapshot por script (KH-004). retrieved_at se actualiza en cada importación.'),
  ('cdmx-gtfs', 'Portal de Datos Abiertos CDMX (GTFS)', 'https://datos.cdmx.gob.mx', 'Por confirmar (OPEN-QUESTIONS #4)', NULL, 'UNVERIFIED',
   'Pendiente de validar licencia antes de importar (KH-007).'),
  ('rutas-cancun-api', 'API Rutas Cancún (externa, preexistente)', NULL, 'Por definir (OPEN-QUESTIONS #2)', NULL, 'UNVERIFIED',
   'Servicio externo declarado (KH-002/KH-003).'),
  ('kindhop-comunidad', 'Reportes de la comunidad KindHop', NULL, 'Propios del proyecto', 'Reporte comunitario, no oficial', 'USER_REPORTED', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, url = EXCLUDED.url, license = EXCLUDED.license,
  attribution = EXCLUDED.attribution, data_status = EXCLUDED.data_status, notes = EXCLUDED.notes;

-- Mismos ids que apps/web/src/features/discovery/categories.js (etiquetas en los JSON de idiomas).
INSERT INTO categories (id, applies_to, sort_order) VALUES
  ('music', '{place,event}', 1), ('art', '{place,event}', 2), ('food', '{place,event}', 3), ('culture', '{place,event}', 4),
  ('beaches', '{place}', 5), ('nightlife', '{place,event}', 6), ('markets', '{place,event}', 7), ('parks', '{place}', 8),
  ('museums', '{place}', 9), ('shopping', '{place}', 10), ('sports', '{place,event}', 11), ('family', '{place,event}', 12)
ON CONFLICT (id) DO UPDATE SET applies_to = EXCLUDED.applies_to, sort_order = EXCLUDED.sort_order;
