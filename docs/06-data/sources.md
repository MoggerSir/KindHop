# Registro de fuentes

Cada dataset real registra: nombre, URL, licencia/atribución, ciudad, fecha de consulta, fecha de actualización de la fuente, límites, confiabilidad y responsable. En la UI todo dato muestra `REAL` / `DEMO` / `USER_REPORTED` / `UNVERIFIED`.

| Fuente | Ciudad | Datos | URL | Licencia / atribución | Consultada | Estado |
|---|---|---|---|---|---|---|
| OpenFreeMap (estilo "liberty", teselas OpenMapTiles) | Ambas | Mapa base | https://openfreemap.org | Datos © OpenStreetMap (ODbL); atribución incluida en el estilo | — | POR VALIDAR términos (OQ #6) |
| OpenStreetMap vía Overpass | Ambas | POI | https://overpass-api.de | ODbL, "© OpenStreetMap contributors" | — | POR VALIDAR (KH-004) |
| API Rutas Cancún (externa, preexistente, autor integrante del equipo) | Cancún | Rutas, paradas, trazos | por definir | por definir | — | POR VALIDAR (KH-002) |
| Portal de Datos Abiertos CDMX (GTFS) | CDMX | Rutas Metrobús | https://datos.cdmx.gob.mx | por confirmar | — | POR VALIDAR (KH-007) |
| Gobierno municipal Benito Juárez / estatal | Cancún | Supermanzanas | por definir | por definir | — | POR VALIDAR (KH-009) |
| Comunidad KinHop | Ambas | Incidencias | — | propias, `USER_REPORTED` | — | POR CREAR (KH-011) |
| Usuario (local) | Ambas | Presupuesto | — | solo en su navegador | — | POR CREAR (KH-010) |

Datos simulados para el pitch (lluvia, encharcamientos): `dataStatus = 'DEMO'` visible en pantalla, nunca mezclados con `REAL` sin etiqueta.
