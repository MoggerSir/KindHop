# Módulo: ciudades y transporte

**Qué hace:** mismo contrato para Cancún y CDMX; cambiar de ciudad cambia fuente y capas, no la app.
**Dónde:** catálogo `apps/api/src/modules/cities/catalog.ts` (+ `routes.ts`); web `apps/web/src/features/cities/`. Transporte futuro: `apps/api/src/modules/transit/{routes.ts,cancun.adapter.ts,cdmx.adapter.ts}`.
**Patrón de adaptador:** una función por fuente `fetchRoutes(): Promise<{ routes, source }>` que normaliza a `TransitRoute` (ver contrato). El router elige el adaptador por `cityId` con un objeto literal; sin clases ni factories.

| Pieza | Estado |
|---|---|
| Catálogo de 2 ciudades con `modules` por estado, validación de `cityId` | IMPLEMENTADO |
| Cancún: API Rutas Cancún (externa, preexistente, de un integrante; se **declara** como tal) | POR VALIDAR (KH-002 → KH-003) |
| CDMX: subconjunto GTFS oficial (p. ej. Metrobús), sin tiempo real | POR VALIDAR (KH-007) |

**Reglas:** nunca inventar rutas, horarios ni tarifas; tarifa solo si la fuente la publica; sin fuente → `modules.transit = 'UNAVAILABLE'` y mensaje honesto.
**Prueba:** `npm test` (catálogo); por adaptador, test de normalización con fixture recortado de la fuente real + test de fallo.
**Terminado cuando:** al menos una ruta real por ciudad en el mapa con fuente y fecha visibles.
