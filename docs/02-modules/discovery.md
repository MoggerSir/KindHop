# Módulo: descubrir (POI y eventos)

**Qué hace:** lugares de interés (playas, museos, parques, plazas) y eventos próximos por ciudad, cada uno con fuente.
**Dónde:** API `apps/api/src/modules/discovery/`; web `apps/web/src/features/discovery/`; script de captura `scripts/fetch-osm-pois.mjs` (KH-004).
**Datos:** OSM vía Overpass, consulta acotada por bbox y categorías, guardada como snapshot versionado con `retrievedAt` (no consultar Overpass en cada request). Atribución ODbL obligatoria. Eventos: solo con `sourceUrl` verificable y `startsAt` futuro.

| Pieza | Estado |
|---|---|
| Zonas (alcaldías CDMX, fixture INEGI/CC-BY) | IMPLEMENTADO (KH-009) |
| Supermanzanas Cancún | UNAVAILABLE (sin fuente con licencia, OQ #3) |
| POI Cancún (snapshot OSM + `GET /pois`) | IMPLEMENTADO (KH-004). La UI muestra crédito ODbL y búsqueda/ficha en Explorar (KH-005); marcadores en KH-006 |
| POI CDMX | PLANIFICADO (KH-007) |
| Búsqueda y ficha de lugar con `DataStatusBadge`, fuente y fecha | IMPLEMENTADO en Explorar (KH-005), texto sin acentos + categoría; CDMX muestra fuente no disponible |
| Tablón de eventos (módulo propio `events`, ver ADR-0003; las reglas de datos de esta página siguen aplicando) | IMPLEMENTADO (KH-014, BD DEMO) |

**Prohibido:** scraping de Google Maps/Places, copiar fichas, mostrar eventos caducados como próximos.
**Prueba:** test del filtro por categoría y de exclusión de eventos pasados.
**Terminado cuando:** tocar un POI abre su ficha con procedencia, y la lista de eventos muestra vacío honesto si no hay ninguno vigente.

## Explorar (KH-005)

`PlaceResults` usa `usePois` → `pois.api.js` → cliente HTTP compartido. Texto y categoría se comparten con eventos; las fechas solo filtran eventos y la interfaz lo explica. No consulta Overpass desde el navegador. Ficha en `Sheet` con nombre, categoría, procedencia, fecha y enlace al objeto OSM. Sin cuenta ni precios inventados. `searchPois.test.js` cubre acentos, traducciones y combinación de filtros.
