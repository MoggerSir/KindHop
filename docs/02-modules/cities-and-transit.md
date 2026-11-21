# Módulo: ciudades y transporte

**Qué hace:** mismo contrato para Cancún y CDMX; cambiar de ciudad cambia fuente y capas, no la app.
**Dónde:** catálogo `apps/api/src/modules/cities/catalog.ts` (+ `routes.ts`); web `apps/web/src/features/cities/`. Transporte: `apps/api/src/modules/transit/` — `routes.ts`, Cancún en vivo `cancun.adapter.ts` (KH-003), CDMX snapshot `adapters/cdmx.ts` + `transit.db.ts` (KH-007) — y `apps/web/src/features/transit/`.
**Patrón de adaptador:** una función por fuente `fetchRoutes(): Promise<{ routes, source }>` que normaliza a `TransitRoute` (ver contrato). El router elige el adaptador por `cityId` con un objeto literal; sin clases ni factories.

## Fuente de verdad de ciudades (issue #8)

**Decisión (hackatón):** el catálogo estático `catalog.ts` manda para la API (`GET /api/cities`, `requireCity()`, `modules` por capa). La tabla `cities` en PostgreSQL replica id, nombre, país, centro, `timezone` y `default_zoom` para claves foráneas y consultas de otros módulos; no guarda `modules` (sigue calculándose en código según adaptadores y datos).

- Cambiar una ciudad piloto = actualizar `catalog.ts` **y** la migración/seeds que rellenan `cities` (hoy `0001_init.sql` + columnas en `0002_mvp_schema.sql`).
- Test de regresión: `apps/api/src/modules/cities/catalog.db.test.ts` (con `DATABASE_URL` y migraciones aplicadas).

| Pieza | Estado |
|---|---|
| Catálogo de 2 ciudades con `modules` por estado, validación de `cityId` | IMPLEMENTADO |
| Alineación catálogo ↔ tabla `cities` (test con PostgreSQL) | IMPLEMENTADO |
| Cancún: rutas **simuladas** DEMO (`adapters/cancun-demo.ts`, 4 rutas con trazado y paradas aproximados, sin tarifa ni horario) | DEMO ([ADR-0008](../adr/0008-rutas-cancun-simuladas-fotos-demo-kinhop.md)); capa en el mapa (KH-006) con badge DEMO y aviso ES/EN |
| Cancún: catálogo público de Rutas Cancún, lectura en vivo (opción A, KH-003) | DESACTIVADO, no borrado: `adapters/cancun-live.ts` + `cancun-live.test.ts` (siguen en CI) |
| CDMX: Metrobús línea 1 desde el GTFS de SEMOVI (CC BY 4.0), un viaje, sin tiempo real ni tarifa | IMPLEMENTADO (KH-007). POI de CDMX sigue planificado |

**Reglas:** nunca inventar horarios ni tarifas; tarifa solo si una fuente REAL la publica; sin fuente → `modules.transit = 'UNAVAILABLE'` y mensaje honesto. Única excepción ([ADR-0008](../adr/0008-rutas-cancun-simuladas-fotos-demo-kinhop.md)): el trazado de Cancún es simulado, con `source.dataStatus = 'DEMO'`, `modules.transit = 'DEMO'`, "Simulada" en cada nombre y el aviso `transit.simulatedNotice` en la web. Para volver a la lectura en vivo: `fetchCancunLiveRoutes` en `transit/routes.ts` y `transit: 'IMPLEMENTED'` en el catálogo.

Lo que sigue documenta la opción A (en vivo), hoy desactivada.

## Decisión KH-003 (2026-11-21): opción A, lectura en vivo

**Elegimos A.** `fetchCancunRoutes()` lee el catálogo público en cada petición, lo guarda como mucho 60 segundos en la memoria del proceso y no escribe en `transit_*`.

No elegimos B (snapshot en `transit_*`) porque los términos no permiten guardar una copia:

1. [Términos de uso](https://rutascancun.com/terms), vigentes desde el 11 de agosto de 2026: el servicio es informativo, se ofrece en el estado en que esté y no conceden licencia para copiar, almacenar o redistribuir el catálogo.
2. Ni `MoggerSir/rutas-cancun` (privado) ni `MoggerSir/RutasCancun` (público) tienen archivo `LICENSE`.
3. `robots.txt` de rutascancun.com publica `Content-Signal: search=yes, ai-train=no, use=reference` y explica que se bloquea a quien se lleva el contenido para publicarlo (el ejemplo que dan es CCBot y su volcado abierto). Reservan derechos bajo el artículo 4 de la Directiva (UE) 2019/790.
4. La [metodología](https://rutascancun.com/metodologia), leída el 21/11/2026, dice que el trazado sale de geometría capturada en campo o de investigación comunitaria. El volcado público está fechado el 6 de septiembre de 2026. No publican horarios ni nombres de parada; KindHop no los rellena.

### Qué respondió el servicio ese día

| Petición | Resultado |
|---|---|
| `GET https://rutascancun.com/datos/catalogo.json` | 200, JSON, 34 rutas, `generado` = `2026-09-06T06:36:11.927Z`. Es el archivo que carga el mapa del sitio (`fetch("/datos/catalogo.json")`). Sin autenticación. |
| `GET https://api.rutascancun.com/api/health` | 200, base de datos `up`. |
| `GET https://api.rutascancun.com/api/routes` y `GET …/api/routes/map-bundle` | 401. El controlador exige JWT. No hay credencial pública y no se usa. |
| `GET https://rutascancun.larpmusic.com.mx/api/routes` | 403. Host antiguo del cliente Flutter; no es la fuente. |

### Reglas del evento (OPEN-QUESTIONS #1)

En el repo no está el nombre ni el reglamento del hackatón de este equipo. El prompt del 20/11/2026 pide consumir la API como servicio externo declarado, sin copiar su código. Las reglas públicas del [Hackatón México 2026](https://hackatonmexico.com/reglas) (actualizadas el 4/11/2026, §9) permiten un componente previo si el equipo tiene derecho a usarlo, lo declara y el jurado distingue qué existía antes. Ese evento es de pagos con CoDi, no de turismo: no consta que sea el de KindHop, así que la pregunta #1 no se cierra con esa cita.

La respuesta de KindHop lleva `source` (nombre, URL, términos, fecha del volcado, `REAL`). El fixture de test (`rutas-cancun-catalogo.recorte.json`) es una ruta **ficticia** con la misma forma JSON; no redistribuye el catálogo y la CI no sale a la red.

### Contrato externo

`GET` de `RUTAS_CANCUN_CATALOG_URL` (por defecto la URL de la tabla). Cuerpo: `{ generado, rutas: [{ codigo, nombre, tarifaMxn, polilinea, … }] }`.

- `polilinea`: polyline de precisión 5 (latitud, longitud) → GeoJSON `LineString` `[lon, lat]`.
- `tarifaMxn`: pesos que publica la fuente (10 o 12 ese día) → `fareCents`. Si falta, el campo no va.
- `mode`: `bus`. El sitio describe camiones y combis; este catálogo no trae metro ni BRT.
- `stops`: `[]`. La fuente no publica paradas.
- `source.retrievedAt`: el `generado` del archivo, no la hora de la petición. El volcado de septiembre no se presenta como dato de hoy.
- Timeout 4 s. Un 4xx/5xx, un corte o un JSON inservible → 502 `TRANSIT_UNAVAILABLE` y no se cachea. CDMX usa su snapshot GTFS (KH-007) y nunca consulta esta fuente. Esta ruta no usa PostgreSQL: sin `DATABASE_URL` Cancún sigue leyendo la fuente.

Si el día de la demo el catálogo no responde, la API dice que el transporte no está disponible. No hay rutas de relleno.

**Prueba:** `npm test` (normalización del recorte, fallo, caché; CDMX en `transit.cdmx.test.ts`). Contra la red, una sola vez: `RUTAS_CANCUN_LIVE=1 npm test -w @kindhop/api -- src/modules/transit/transit.test.ts`.
**Terminado cuando:** al menos una ruta real por ciudad en el mapa con fuente y fecha visibles. La API de Cancún ya cumple la parte de datos; el mapa es KH-006. CDMX ya muestra la línea 1 de Metrobús (KH-007).
