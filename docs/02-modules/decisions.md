# Módulo: motor de decisiones

**Qué hace:** reglas deterministas que proponen un lugar alternativo y explican por qué. No usa un modelo de lenguaje.
**Dónde:** `apps/api/src/modules/decisions/` (`suggest()` pura, `decisions.db.ts` con el SQL, `GET /api/cities/:cityId/suggestions`).
**Datos:** lee `places`, `urban_reports` y `data_sources`. No escribe. El presupuesto no tiene tabla: el cliente manda `budget=low`.

| Pieza | Estado |
|---|---|
| Alternativa de la misma categoría, ordenada por distancia, sin incidencia activa a < 300 m | IMPLEMENTADO (issue #11) |
| Presupuesto bajo: `is_free = true` primero; `NULL` no es gratis | IMPLEMENTADO (issue #11) |
| Cada sugerencia con `why`, `source`, `asOf`, `confidence` y `dataStatus` | IMPLEMENTADO (issue #11) |
| `EXPLAIN` usa `places_city_coords_idx` | IMPLEMENTADO (el plan va en el PR) |
| Pantalla que muestra el «por qué» | IMPLEMENTADO (KH-020): `features/discovery/LocalAlternative.jsx` en la ficha de Explorar, Inicio y Mapa |
| **Gasto local:** origen de cadena (`is_chain`) → solo candidatos sin marca de cadena, con «por qué» | IMPLEMENTADO (KH-020) |

**Reglas de confianza** (fijas, no un puntaje): incidencia cercana = `MEDIUM` (la distancia es aproximada); `budget=low` e `is_free = true` = `HIGH`; precio desconocido, de pago o lugar sin fuente = `LOW`; origen de cadena y alternativa sin marca de cadena en OSM = `MEDIUM` (que OSM no registre marca no prueba al 100 % que sea local). Si aplican varias, queda la más baja.

**Gasto local (KH-020):** se activa solo, sin parámetro, cuando el lugar de partida tiene `is_chain = true`. El SQL filtra `is_chain IS FALSE` (los `NULL` no cuentan como locales) y el `why` nombra la marca de la cadena.

**Radio:** 40 km desde el lugar de partida. Más lejos no se sugiere. La caja `lat`/`lon` solo prefiltra para el índice; la distancia que ordena y recorta es haversine (radio 6 371 km), no PostGIS.

**PostGIS:** no se adopta. El catálogo DEMO tiene 10 lugares, muy por debajo de las 10 000 del [ADR-0006](../adr/0006-base-de-datos-mvp.md). La consulta de «cerca de» cabe en el índice `(city_id, lat, lon)`.

**Prueba:** `npm test -w @kindhop/api` con `DATABASE_URL` (las reglas de SQL se saltan si no hay base). Sin base, un `placeId` válido responde 503 `DATABASE_UNAVAILABLE`.
**Terminado:** la UI muestra `why`, fuente, confianza y `dataStatus` (KH-020, 21/11/2026).
