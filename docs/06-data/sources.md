# Registro de fuentes

Cada dataset real registra: nombre, URL, licencia/atribución, ciudad, fecha de consulta, fecha de actualización de la fuente, límites, confiabilidad y responsable. En la UI todo dato muestra `REAL` / `DEMO` / `USER_REPORTED` / `UNVERIFIED`.

| Fuente | Ciudad | Datos | URL | Licencia / atribución | Consultada | Estado |
|---|---|---|---|---|---|---|
| OpenFreeMap (estilo "dark", teselas OpenMapTiles) | Ambas | Mapa base | https://openfreemap.org | Datos © OpenStreetMap (ODbL); atribución incluida en el estilo | — | POR VALIDAR términos (OQ #6) |
| OpenStreetMap vía Overpass | Cancún (CDMX pendiente, KH-007) | POI con nombre: playas, museos, parques, mercados y plazas | https://overpass-api.de (si saturado, https://overpass.openstreetmap.fr) | ODbL 1.0, "© OpenStreetMap contributors" | 2026-11-21 | EN USO. Caja `21.02,-86.98,21.24,-86.74`. Marca OSM `2026-11-21T02:41:32Z`. 118 lugares REAL (18 playas, 3 museos, 83 parques, 4 mercados, 10 deportes). Se descartan nombres genéricos («parque», «sin nombre») y lo que no es un lugar (camellón, rotonda, glorieta, privadas, residencial, entrada). Reimportar deja 118 (0 insertados) y no toca las 10 filas DEMO. Ninguno traía `name:en`. Plazas (`place=square`) con nombre: 0 (2 sin nombre, no se importan). Script `npm run db:import-osm` |
| API Rutas Cancún (catálogo público; servicio externo preexistente, autor integrante del equipo) | Cancún | Trazos y tarifa de camiones y combis. Sin paradas ni horarios | https://rutascancun.com/datos/catalogo.json | Sin licencia de redistribución. Términos: servicio informativo, https://rutascancun.com/terms (desde 2026-08-11). Content-Signal `use=reference` | 2026-11-21 | EN USO, lectura en vivo (KH-003). Volcado `generado` 2026-09-06. No se guarda copia |
| Portal de Datos Abiertos CDMX (GTFS) | CDMX | Rutas Metrobús | https://datos.cdmx.gob.mx | por confirmar | — | POR VALIDAR (KH-007) |
| Portal de Datos Abiertos CDMX — Límite de Alcaldías (INEGI Marco Geoestadístico 2020) | CDMX | Alcaldías (polígonos) | https://www.datos.cdmx.gob.mx/dataset/alcaldias | CC-BY-4.0-ESP · © INEGI | 2026-11-21 | EN USO (REAL) · fixture `apps/api/src/modules/discovery/data/cdmx.alcaldias.geojson` |
| Gobierno municipal Benito Juárez / IMPLAN Cancún | Cancún | Supermanzanas | https://implancancun.gob.mx/mapas | Sin GeoJSON público con licencia clara (PDUCP/imágenes y WMS; no redistribución verificada) | 2026-11-21 | SIN DATOS (capa UNAVAILABLE; OPEN-QUESTIONS #3) |
| Comunidad KindHop | Ambas | Incidencias | — | propias, `USER_REPORTED` | — | POR CREAR (KH-011) |
| Fotos de eventos DEMO (Wikimedia Commons) | Cancún | 4 fotos en `apps/web/public/demo/events/` | ver filas siguientes | crédito visible en el detalle del evento | 2026-11-20 | EN USO (DEMO) |
| └ `night-market.jpg`: [Tianguis de la Puri por la noche](https://commons.wikimedia.org/wiki/File:Tianguis_de_la_Puri_por_la_noche.jpg) | — | — | — | Samantha RV · CC0 | 2026-11-20 | miniatura 480 px: solo en tarjeta compacta (cambiar por 960 px si pasa a destacado) |
| └ `concert.jpg`: [Evento Parque Palapas Cancun](https://commons.wikimedia.org/wiki/File:Evento_Parque_Palapas_Cancun.JPG) | — | — | — | Czardelarua · CC BY-SA 4.0 | 2026-11-20 | EN USO |
| └ `ceramics.jpg`: [Pottery Master](https://commons.wikimedia.org/wiki/File:Pottery_Master.jpg) | — | — | — | Tahirceylan · CC BY-SA 4.0 | 2026-11-20 | EN USO |
| └ `food.jpg`: [Parque de las Palapas 1](https://commons.wikimedia.org/wiki/File:Parque_de_las_Palapas_1.jpg) | — | — | — | City Foodsters · CC BY 2.0 | 2026-11-20 | EN USO |
| Usuario (local) | Ambas | Presupuesto | — | solo en su navegador | — | POR CREAR (KH-010) |

Datos simulados para el pitch (lluvia, encharcamientos): `dataStatus = 'DEMO'` visible en pantalla, nunca mezclados con `REAL` sin etiqueta.
