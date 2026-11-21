-- Catálogo base: fuentes y categorías. Idempotente (upsert). Se aplica con: npm run db:seed
INSERT INTO data_sources (id, name, url, license, attribution, data_status, notes) VALUES
  ('kindhop-demo', 'Datos simulados de KindHop', NULL, 'Propios del proyecto', 'Ejemplo: no son datos reales', 'DEMO',
   'Todo lo que apunta aquí se muestra con la etiqueta DEMO y lo regeneran los seeds.'),
  ('osm', 'OpenStreetMap vía Overpass', 'https://www.openstreetmap.org/copyright', 'ODbL 1.0', '© OpenStreetMap contributors', 'REAL',
   'Snapshot por script (KH-004). retrieved_at se actualiza en cada importación.'),
  ('cdmx-gtfs', 'GTFS estático CDMX (SEMOVI)', 'https://datos.cdmx.gob.mx/dataset/gtfs', 'CC BY 4.0 | https://creativecommons.org/licenses/by/4.0/deed.es', 'Secretaría de Movilidad (SEMOVI), Gobierno de la Ciudad de México', 'REAL',
   'Subconjunto Metrobús línea 1 (route_id B_CMX0300L1): un viaje representativo (trip_id B_03100L1000_0, el de más paradas; empate por trip_id). No es el feed completo ni tiempo real. Licencia CC BY 4.0, id de portal CC-BY-4.0-ESP, https://creativecommons.org/licenses/by/4.0/deed.es. Dataset https://datos.cdmx.gob.mx/dataset/gtfs (package 75538d96-3ade-4bc5-ae7d-d85595e4522d). El 2026-11-21 el TLS de datos.cdmx.gob.mx se cortaba; se usó la copia Mobility Database mdb-1830-202603090024 del ZIP oficial, 2397374 bytes (mismo tamaño que el recurso del portal). Archivos internos fechados el 2026-02-16. Sin fare_attributes.txt: fare_cents queda vacío. Importar con npm run db:import:cdmx.'),
  ('rutas-cancun-api', 'API Rutas Cancún (catálogo público, servicio externo preexistente)',
   'https://rutascancun.com/datos/catalogo.json',
   'Sin licencia de redistribución. Términos: servicio informativo en https://rutascancun.com/terms (vigentes desde 2026-08-11). Content-Signal use=reference; no se guarda copia.',
   'Rutas Cancún — servicio externo preexistente, declarado. No afiliado a transportistas.',
   'REAL',
   'Lectura en vivo (KH-003, opción A). No se escribe en transit_*. GET https://api.rutascancun.com/api/routes exige JWT (401). Volcado generado 2026-09-06. Sin paradas ni horarios.'),
  ('kindhop-comunidad', 'Reportes de la comunidad KindHop', NULL, 'Propios del proyecto', 'Reporte comunitario, no oficial', 'USER_REPORTED', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, url = EXCLUDED.url, license = EXCLUDED.license,
  attribution = EXCLUDED.attribution, data_status = EXCLUDED.data_status, notes = EXCLUDED.notes;

-- Mismos ids que apps/web/src/features/discovery/categories.js (etiquetas en los JSON de idiomas).
INSERT INTO categories (id, applies_to, sort_order) VALUES
  ('music', '{place,event}', 1), ('art', '{place,event}', 2), ('food', '{place,event}', 3), ('culture', '{place,event}', 4),
  ('beaches', '{place}', 5), ('nightlife', '{place,event}', 6), ('markets', '{place,event}', 7), ('parks', '{place}', 8),
  ('museums', '{place}', 9), ('shopping', '{place}', 10), ('sports', '{place,event}', 11), ('family', '{place,event}', 12)
ON CONFLICT (id) DO UPDATE SET applies_to = EXCLUDED.applies_to, sort_order = EXCLUDED.sort_order;
