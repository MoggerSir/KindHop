# Módulo: descubrir (POI y eventos)

**Qué hace:** lugares de interés (playas, museos, parques, plazas) y eventos próximos por ciudad, cada uno con fuente.
**Dónde:** API `apps/api/src/modules/discovery/`; web `apps/web/src/features/discovery/`; script de captura `scripts/fetch-osm-pois.mjs` (KH-004).
**Datos:** OSM vía Overpass, consulta acotada por bbox y categorías, guardada como snapshot versionado con `retrievedAt` (no consultar Overpass en cada request). Atribución ODbL obligatoria. Eventos: solo con `sourceUrl` verificable y `startsAt` futuro.

| Pieza | Estado |
|---|---|
| POI Cancún (snapshot OSM + `GET /pois`) | IMPLEMENTADO (KH-004). La UI muestra el crédito ODbL; los marcadores y la ficha son KH-005 |
| POI CDMX | PLANIFICADO (KH-007) |
| Ficha de lugar con `DataStatusBadge`, fuente y fecha | PLANIFICADO (KH-005) |
| Tablón de eventos (módulo propio `events`, ver ADR-0003; las reglas de datos de esta página siguen aplicando) | PLANIFICADO (KH-014) |

**Prohibido:** scraping de Google Maps/Places, copiar fichas, mostrar eventos caducados como próximos.
**Prueba:** test del filtro por categoría y de exclusión de eventos pasados.
**Terminado cuando:** tocar un POI abre su ficha con procedencia, y la lista de eventos muestra vacío honesto si no hay ninguno vigente.
