# KinHop

> **KinHop** (repositorio técnico `KindHop`, paquetes `@kindhop/*`) **lleva el gasto del turista a los negocios locales.** Cuando abres un lugar de cadena, te propone negocios locales cercanos de la misma categoría, explica por qué (fuente, distancia, confianza) y te muestra qué parte de tu gasto se quedó en la ciudad. Mapa, lugares, eventos, rutas y presupuesto de viaje en una app mobile-first. Pilotos: **Cancún** (principal) y **Ciudad de México** (prueba multicidad). Hack Maya 2026, líneas turismo y economía · repo creado desde cero el **20/11/2026**.
>
> Ángulo, rúbrica y plan: [`HACKATHON.md`](HACKATHON.md) · guion del pitch: [`PITCH.md`](PITCH.md) · demo: [`docs/05-delivery/demo.md`](docs/05-delivery/demo.md).

**No recorras `src/` entero.** Busca tu tarea en la tabla, abre la ruta y su documento. Nada más.

## Router: tarea → archivo

| Tarea | Ruta exacta | Contexto (leer) | Prueba |
|---|---|---|---|
| Pantallas, pestañas, layout | `apps/web/src/app/{App.jsx,layout/,navigation/,screens/}` | [screens](docs/03-design/screens.md), [ux-rules](docs/03-design/ux-rules.md) | `npm run check` + navegador 390px |
| Arquitectura, carpetas, recetas (módulo / feature / ciudad nueva) | — | [overview](docs/01-architecture/overview.md), [ADR-0003](docs/adr/0003-monolito-modular-features-adaptadores.md) | — |
| Mapa (MapLibre, estilo, capas) | `apps/web/src/features/map/CityMap.jsx` | [map](docs/02-modules/map.md) | navegador: mapa visible + atribución |
| Selector y datos de ciudad (web) | `apps/web/src/features/cities/` | [cities-and-transit](docs/02-modules/cities-and-transit.md) | cambiar Cancún ↔ CDMX |
| Catálogo de ciudades (API) | `apps/api/src/modules/cities/catalog.ts` | [cities-and-transit](docs/02-modules/cities-and-transit.md) | `npm test` |
| Transporte Cancún (API en vivo) / CDMX (GTFS) | `apps/api/src/modules/transit/` (Cancún: `cancun.adapter.ts`; CDMX: `adapters/cdmx.ts`, `transit.db.ts`), `scripts/import-cdmx-gtfs.mjs`, `apps/web/src/features/transit/` | [cities-and-transit](docs/02-modules/cities-and-transit.md), [sources](docs/06-data/sources.md) | `npm test`; mapa en CDMX tras `db:import:cdmx`; la capa de Cancún es KH-006 |
| POI Cancún y zonas | `apps/api/src/modules/discovery/` (POI KH-004; zonas KH-009), `scripts/fetch-osm-pois.mjs`, capas `DataLayers` en web | [discovery](docs/02-modules/discovery.md) | test del filtro; marcadores en KH-005; alcaldías CDMX REAL, Cancún sin datos (`districts.test.ts`) |
| Eventos | `apps/web/src/features/events/`, `apps/api/src/modules/events/` | [discovery](docs/02-modules/discovery.md), [contract](docs/04-api/contract.md) | test: solo eventos futuros |
| Adaptador por ciudad / ciudad nueva | `apps/api/src/shared/city-adapters.ts`, `modules/cities/catalog.ts` | [overview → recetas](docs/01-architecture/overview.md) | `npm test` |
| Incidencias / inundaciones (API) | `apps/api/src/modules/reports/` (KH-011; la capa web es KH-012) | [reports](docs/02-modules/reports.md), [contract](docs/04-api/contract.md) | `npm test` con `DATABASE_URL`: caducidad, 400, `UNVERIFIED` |
| Presupuesto y gastos | `apps/web/src/features/budget/` (KH-010) | [budget](docs/02-modules/budget.md) | test de cálculo en centavos |
| Motor de decisiones y gasto local (KH-020) | `apps/api/src/modules/decisions/`, web `features/discovery/LocalAlternative.jsx`, `features/budget/LocalSpendMeter.jsx` | [decisions](docs/02-modules/decisions.md), [contract](docs/04-api/contract.md) | `npm test` con `DATABASE_URL`; navegador: Explorar → «Starbucks» |
| Carga de datos en la web (hook común) | `apps/web/src/shared/hooks/useResource.js` | [overview](docs/01-architecture/overview.md) | `npm run check` |
| Cliente HTTP web | `apps/web/src/shared/lib/http.js` | [contract](docs/04-api/contract.md) | estado de error con "Reintentar" |
| Montaje de rutas API | `apps/api/src/app.ts` | [contract](docs/04-api/contract.md) | `npm test` |
| Login con Google y sesiones | `apps/api/src/modules/auth/`, `apps/web/src/features/auth/` | [auth](docs/02-modules/auth.md), [ADR-0009](docs/adr/0009-autenticacion-google-sesiones.md) | `npm test` (auth.test.ts, rate-limit.test.ts y proxy.test.js) |
| Errores API | `apps/api/src/shared/errors.ts` | [contract](docs/04-api/contract.md) | `npm test` |
| PostgreSQL / migraciones / seeds | `db/migrations/`, `db/seeds/`, `apps/api/src/shared/db.ts` | [database](docs/06-data/database.md), [db/README](db/README.md) | `npm run db:migrate` y `npm run db:seed` (2 veces) |
| Textos e idiomas (ES/EN) | `apps/web/src/shared/i18n/locales/{es,en}.json` | [i18n](docs/03-design/i18n.md) | `npm run check` (claves iguales en ambos) |
| Movimiento (motion design) | `apps/web/src/shared/motion/` | [motion](docs/03-design/motion.md) | navegador + movimiento reducido |
| Estilos y tokens | `apps/web/src/index.css` (`@theme`) | [ux-rules](docs/03-design/ux-rules.md) | `npm run check` |
| CI | `.github/workflows/ci.yml` | [WORKFLOW](docs/agent/WORKFLOW.md) | PR en GitHub |
| Demo para jueces | — | [demo](docs/05-delivery/demo.md), [checklist](docs/05-delivery/checklist.md) | guion 3 veces seguidas |
| Tareas disponibles | — | [backlog](docs/05-delivery/backlog.md) | — |

¿No aparece? → [`docs/FILEMAP.md`](docs/FILEMAP.md) → [`docs/agent/ROUTER.md`](docs/agent/ROUTER.md). Reglas para agentes: [`AGENTS.md`](AGENTS.md).

## Arrancar

Requiere Node ≥ 22.12 y Docker (PostgreSQL). **Toda la API exige sesión** ([auth](docs/02-modules/auth.md)): sin `SESSION_SECRET` responde 503 `AUTH_NOT_CONFIGURED`.

```bash
npm ci                                   # instala con package-lock.json
cp apps/api/.env.example apps/api/.env   # luego edita apps/api/.env:
#   DATABASE_URL=postgres://kindhop:kindhop@localhost:55432/kindhop
#   SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))")
#   AUTH_DEV_LOGIN=true                  # botón «Entrar con la cuenta demo» (nunca con NODE_ENV=production)
#   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET  # opcional: login real con Google (ver docs/02-modules/auth.md)
docker compose up -d db && npm run db:migrate && npm run db:seed
npm run db:import-osm                    # lugares y comercios reales de Cancún (Overpass); se puede repetir
npm run db:import:cdmx                   # Metrobús línea 1 desde el fixture local (sin red); se puede repetir
npm run dev                              # API :3001 + web :5173 (Vite proxifica /api)
npm run check                            # typecheck API + lint web + tests + enlaces de docs
npm run build                            # compila API (dist/) y web (dist/)
```

**Login obligatorio (KH-019, [ADR-0009](docs/adr/0009-autenticacion-google-sesiones.md)):** toda `/api` salvo `/health` y `/api/auth/*` exige sesión, así que la demo local necesita PostgreSQL (usuarios y sesiones) y, en `apps/api/.env`:

- `SESSION_SECRET`: ≥ 32 caracteres aleatorios, distinto por entorno (`node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`). Sin él la API responde 503 a todo.
- `PUBLIC_URL` (y `WEB_ORIGIN`): el origen exacto de la web, `http://localhost:5173` en local.
- Para entrar sin Google en desarrollo: `AUTH_DEV_LOGIN=true` ("Entrar con la cuenta demo"). Se ignora siempre con `NODE_ENV=production`.
- Para Google: `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` de un cliente OAuth "Aplicación web" con redirect `<PUBLIC_URL>/api/auth/google/callback` ([pasos](docs/02-modules/auth.md#configurar-google-una-vez-por-entorno)).

Nunca subas estos valores a Git ni a variables `VITE_*`: en el despliegue van en los secretos del proveedor de la API.

Abre `http://localhost:5173` → **Entrar con la cuenta demo** → Explorar → escribe «Starbucks» → abre el resultado: verás la alternativa local. Si Overpass responde 504, repite con un espejo: `OVERPASS_URL=https://overpass.openstreetmap.fr/api/interpreter npm run db:import-osm`.

**Datos simulados por reglas del hackatón:** las reglas no permiten consumir APIs creadas por integrantes del equipo antes del evento, así que las **rutas de transporte de Cancún son simuladas** y la app las marca `DEMO`. Lugares de Cancún (OpenStreetMap) y Metrobús L1 de CDMX (GTFS oficial) son `REAL`. Detalle en [ADR-0008](docs/adr/0008-rutas-cancun-simuladas-fotos-demo-kinhop.md) y [OPEN-QUESTIONS #1](docs/OPEN-QUESTIONS.md).

### Base de datos en la demo desplegada (Refs #10 · KH-016)

1. Provisionar PostgreSQL gestionado **gratis** (recomendado: [Neon](https://neon.tech); alternativas: [Supabase](https://supabase.com/pricing), [Prisma Postgres](https://www.prisma.io/pricing) — comparativa actualizada en [`db/README.md`](db/README.md)).
2. Guardar **`DATABASE_URL` solo en secretos** del proveedor de la API (nunca en git ni variables `VITE_`). Neon/Supabase suelen incluir `sslmode=require` en la URL; si no, `DATABASE_SSL=true` (ver `.env.example`).
3. Tras desplegar la API, ejecutar **una vez** (o en un job de release): `npm run db:migrate && npm run db:seed` con esa `DATABASE_URL`.
4. **Antes del pitch:** repetir `npm run db:seed` para refrescar fechas DEMO.
5. Verificar `GET /health` → `database.connected: true`.

## Stack (fijo, ver [ADR-0001](docs/adr/0001-monorepo.md)) y arquitectura ([ADR-0003](docs/adr/0003-monolito-modular-features-adaptadores.md))

React 19 + JSX + Tailwind 4 + Vite + `motion` (web; tema oscuro con acento lima, [ADR-0007](docs/adr/0007-tema-oscuro-acento-lima.md), y motion design, [ADR-0005](docs/adr/0005-tarjeta-de-visita-y-motion.md)) · Node + Express 5 + TypeScript (API) · PostgreSQL · MapLibre GL + OpenStreetMap · npm workspaces. Sin microservicios ni orquestadores.

## Estado (21/11/2026)

| Pieza | Estado |
|---|---|
| Monorepo, lockfile, `dev` / `check` / `build` / `test` / `db:migrate` | IMPLEMENTADO y verificado |
| API `/health`, `/api/cities`, `/api/cities/:cityId` con validación y errores tipados | IMPLEMENTADO (6 tests) |
| Web: selector Cancún ↔ CDMX, mapa MapLibre que vuela entre ciudades, estados carga/error/reintento | IMPLEMENTADO |
| Migración 0001 (ciudades, lugares, eventos, incidencias) | IMPLEMENTADO, probada en PostgreSQL 16 |
| API de incidencias (`/api/cities/:cityId/reports`) | IMPLEMENTADO (KH-011); la capa web sigue en KH-012 |
| Sugerencias (`GET /api/cities/:cityId/suggestions`) | IMPLEMENTADO (KH-013) |
| **Gasto local** (KH-020): cadenas por `brand` de OSM, alternativa local explicada en la ficha y medidor en la Billetera | IMPLEMENTADO (774 lugares REAL; 207 de 656 comercios son cadena) |
| Transporte Cancún `GET /api/cities/cancun/transit` | IMPLEMENTADO con rutas **simuladas** (`DEMO`) por reglas del hackatón (OPEN-QUESTIONS #1) |
| POI Cancún: importación OSM y `GET /api/cities/:cityId/pois` | IMPLEMENTADO (KH-004). Ficha y marcadores: KH-005 |
| Presupuesto y gastos manuales locales | IMPLEMENTADO (KH-010), gráfico, historial editable y exportación CSV |
| Transporte CDMX: Metrobús línea 1 (`GET /transit` + capa) | IMPLEMENTADO (KH-007) tras `npm run db:import:cdmx` |
| Supermanzanas de Cancún, capa de transporte de Cancún | PLANIFICADO → [backlog](docs/05-delivery/backlog.md) |
| Fuentes de datos reales | POR VALIDAR → [sources](docs/06-data/sources.md) |

## Reglas de oro

0. **Git: solo PRs hacia `developers`.** Nadie (persona ni agente) hace push a `developers` ni a `main`; los agentes no integran PRs. Ver [FLUJO_GIT](docs/agent/FLUJO_GIT.md).

1. **Repo nuevo:** no copiar código ni historial de Larpatron ni de Rutas Cancún. La API de Rutas Cancún se consume como servicio externo **declarado** (ver [OPEN-QUESTIONS](docs/OPEN-QUESTIONS.md)).
2. **Datos honestos:** todo dato lleva `REAL` / `DEMO` / `USER_REPORTED` / `UNVERIFIED`, fuente y fecha. Nada se presenta como "en vivo" si no lo es.
3. **Finanzas honestas:** gasto manual/CSV; nunca tarjeta, CVV ni credenciales; no Google Wallet/Pay.
4. **Idiomas:** ningún texto fijo en la web; todo en `shared/i18n/locales/{es,en}.json` con `t()` ([i18n](docs/03-design/i18n.md)).
5. **Vertical slice:** UI + API + datos + error + prueba, uno a la vez. `main` siempre demostrable.
6. **Si cambias una ruta,** actualiza esta tabla y `docs/FILEMAP.md` en el mismo commit.

Licencia: pendiente de decisión del equipo ([LICENSE-NOTICE](LICENSE-NOTICE.md)).

### Explorar (KH-005)

Busca eventos y lugares OSM de Cancún con texto y categorías. Los filtros de fecha solo afectan eventos. Cada lugar abre una ficha con fuente y fecha; CDMX muestra un vacío honesto hasta disponer de fuente POI. Rutas: `apps/web/src/features/events/EventSearch.jsx` y `apps/web/src/features/discovery/PlaceResults.jsx`.
