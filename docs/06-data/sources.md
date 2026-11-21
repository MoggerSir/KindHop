# Registro de fuentes

Cada dataset real registra: nombre, URL, licencia/atribución, ciudad, fecha de consulta, fecha de actualización de la fuente, límites, confiabilidad y responsable. En la UI todo dato muestra `REAL` / `DEMO` / `USER_REPORTED` / `UNVERIFIED`.

| Fuente | Ciudad | Datos | URL | Licencia / atribución | Consultada | Estado |
|---|---|---|---|---|---|---|
| OpenFreeMap (estilo "liberty", teselas OpenMapTiles) | Ambas | Mapa base | https://openfreemap.org | Datos © OpenStreetMap (ODbL); atribución incluida en el estilo | — | POR VALIDAR términos (OQ #6) |
| OpenStreetMap vía Overpass | Cancún (POI de CDMX sigue pendiente) | POI con nombre: playas, museos, parques, mercados y plazas | https://overpass-api.de (si saturado, https://overpass.openstreetmap.fr) | ODbL 1.0, "© OpenStreetMap contributors" | 2026-11-21 | EN USO. Caja `21.02,-86.98,21.24,-86.74`. Marca OSM `2026-11-21T02:41:32Z`. 118 lugares REAL (18 playas, 3 museos, 83 parques, 4 mercados, 10 deportes). Se descartan nombres genéricos («parque», «sin nombre») y lo que no es un lugar (camellón, rotonda, glorieta, privadas, residencial, entrada). Reimportar deja 118 (0 insertados) y no toca las 10 filas DEMO. Ninguno traía `name:en`. Plazas (`place=square`) con nombre: 0 (2 sin nombre, no se importan). Script `npm run db:import-osm` |
| API Rutas Cancún (externa, preexistente, autor integrante del equipo) | Cancún | Rutas, paradas, trazos | por definir | por definir | — | POR VALIDAR (KH-002) |
| Portal de Datos Abiertos CDMX (GTFS, SEMOVI) | CDMX | Metrobús línea 1 (un viaje) | https://datos.cdmx.gob.mx/dataset/gtfs | CC BY 4.0 (`CC-BY-4.0-ESP`) · [deed](https://creativecommons.org/licenses/by/4.0/deed.es) · Secretaría de Movilidad (SEMOVI), Gobierno de la Ciudad de México | 2026-11-21 | EN USO (REAL). Ver nota debajo |
| Gobierno municipal Benito Juárez / estatal | Cancún | Supermanzanas | por definir | por definir | — | POR VALIDAR (KH-009) |
| Comunidad KindHop | Ambas | Incidencias | — | propias, `USER_REPORTED` | — | POR CREAR (KH-011) |
| Fotos de eventos DEMO (Wikimedia Commons) | Cancún | 4 fotos en `apps/web/public/demo/events/` | ver filas siguientes | crédito visible en el detalle del evento | 2026-11-20 | EN USO (DEMO) |
| └ `night-market.jpg`: [Tianguis de la Puri por la noche](https://commons.wikimedia.org/wiki/File:Tianguis_de_la_Puri_por_la_noche.jpg) | — | — | — | Samantha RV · CC0 | 2026-11-20 | miniatura 480 px: solo en tarjeta compacta (cambiar por 960 px si pasa a destacado) |
| └ `concert.jpg`: [Evento Parque Palapas Cancun](https://commons.wikimedia.org/wiki/File:Evento_Parque_Palapas_Cancun.JPG) | — | — | — | Czardelarua · CC BY-SA 4.0 | 2026-11-20 | EN USO |
| └ `ceramics.jpg`: [Pottery Master](https://commons.wikimedia.org/wiki/File:Pottery_Master.jpg) | — | — | — | Tahirceylan · CC BY-SA 4.0 | 2026-11-20 | EN USO |
| └ `food.jpg`: [Parque de las Palapas 1](https://commons.wikimedia.org/wiki/File:Parque_de_las_Palapas_1.jpg) | — | — | — | City Foodsters · CC BY 2.0 | 2026-11-20 | EN USO |
| Usuario (local) | Ambas | Presupuesto | — | solo en su navegador | — | POR CREAR (KH-010) |

Datos simulados para el pitch (lluvia, encharcamientos): `dataStatus = 'DEMO'` visible en pantalla, nunca mezclados con `REAL` sin etiqueta.

## GTFS de CDMX (KH-007, consultado el 2026-11-21)

Licencia declarada por el portal, no por catálogos de terceros:

- Dataset: [GTFS estático de la Ciudad de México](https://datos.cdmx.gob.mx/dataset/gtfs) (package `75538d96-3ade-4bc5-ae7d-d85595e4522d`), Secretaría de Movilidad (SEMOVI).
- API CKAN: `GET https://datos.cdmx.gob.mx/api/3/action/package_show?id=gtfs` devuelve `license_id: CC-BY-4.0-ESP`. El mismo id, en el historial del dataset, se titula «Español - Creative Commons Attribution 4.0» y apunta a [https://creativecommons.org/licenses/by/4.0/deed.es](https://creativecommons.org/licenses/by/4.0/deed.es).
- CC BY 4.0 permite copiar, adaptar y redistribuir, también con fin comercial, citando al autor, enlazando la licencia e indicando los cambios. Aquí el cambio es un subconjunto: Metrobús línea 1, un viaje, sin el resto de la red.
- `isopen: false` en esa respuesta es porque `CC-BY-4.0-ESP` no está en [`license_list`](https://datos.cdmx.gob.mx/api/3/action/license_list) del CKAN actual (el id se conserva; el registro de licencias del portal no). Transitland etiqueta el mismo feed como CC-BY-1.0: no se usa esa lectura.
- El recurso ZIP del portal pesa 2 397 374 bytes (`last_modified` 2026-08-28, fecha de la migración del portal, no necesariamente del contenido). Ese día el TLS de `datos.cdmx.gob.mx` cortaba el saludo (también le falló a Transitland). La copia usada es [mdb-1830-202603090024](https://files.mobilitydatabase.org/mdb-1830/mdb-1830-202603090024/mdb-1830-202603090024.zip), archivada por Mobility Database desde la URL oficial del productor, con el mismo tamaño. Los `.txt` internos están fechados el 2026-02-16. No hay `fare_attributes.txt`: `fare_cents` queda vacío. No es tiempo real.
- Importación: `npm run db:import:cdmx` lee `scripts/fixtures/cdmx-gtfs/` (recorte del ZIP, sin red) y hace upsert por `(source_id, external_id)`. Viaje representativo: el de más filas en `stop_times.txt`; si empatan, el `trip_id` menor (`B_03100L1000_0`). `retrieved_at` del snapshot: `2026-11-21T02:50:00Z`.
