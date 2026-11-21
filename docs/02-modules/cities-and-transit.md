# Módulo: ciudades y transporte

**Qué hace:** mismo contrato para Cancún y CDMX; cambiar de ciudad cambia fuente y capas, no la app.
**Dónde:** catálogo `apps/api/src/modules/cities/catalog.ts` (+ `routes.ts`); web `apps/web/src/features/cities/`. Transporte CDMX: `apps/api/src/modules/transit/` (`routes.ts`, `adapters/cdmx.ts`, `transit.db.ts`) y `apps/web/src/features/transit/`. Cancún sigue sin adaptador (KH-003).
**Patrón de adaptador:** una función por fuente `fetchRoutes(): Promise<{ routes, source }>` que normaliza a `TransitRoute` (ver contrato). El router elige el adaptador por `cityId` con un objeto literal; sin clases ni factories.

## Fuente de verdad de ciudades (issue #8)

**Decisión (hackatón):** el catálogo estático `catalog.ts` manda para la API (`GET /api/cities`, `requireCity()`, `modules` por capa). La tabla `cities` en PostgreSQL replica id, nombre, país, centro, `timezone` y `default_zoom` para claves foráneas y consultas de otros módulos; no guarda `modules` (sigue calculándose en código según adaptadores y datos).

- Cambiar una ciudad piloto = actualizar `catalog.ts` **y** la migración/seeds que rellenan `cities` (hoy `0001_init.sql` + columnas en `0002_mvp_schema.sql`).
- Test de regresión: `apps/api/src/modules/cities/catalog.db.test.ts` (con `DATABASE_URL` y migraciones aplicadas).

| Pieza | Estado |
|---|---|
| Catálogo de 2 ciudades con `modules` por estado, validación de `cityId` | IMPLEMENTADO |
| Alineación catálogo ↔ tabla `cities` (test con PostgreSQL) | IMPLEMENTADO |
| Cancún: API Rutas Cancún (externa, preexistente, de un integrante; se **declara** como tal) | POR VALIDAR (KH-002 → KH-003) |
| CDMX: Metrobús línea 1 desde el GTFS de SEMOVI (CC BY 4.0), un viaje, sin tiempo real ni tarifa | IMPLEMENTADO (KH-007). POI de CDMX sigue planificado |

**Reglas:** nunca inventar rutas, horarios ni tarifas; tarifa solo si la fuente la publica; sin fuente → `modules.transit = 'UNAVAILABLE'` y mensaje honesto.
**Prueba:** `npm test` (catálogo); por adaptador, test de normalización con fixture recortado de la fuente real + test de fallo.
**Terminado cuando:** al menos una ruta real por ciudad en el mapa con fuente y fecha visibles. CDMX ya muestra la línea 1; Cancún sigue en KH-003.
