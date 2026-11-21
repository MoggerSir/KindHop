# KindHop

> Plataforma mobile-first de inteligencia urbana: movilidad, lugares, incidencias, eventos y presupuesto de viaje en un mapa, con decisiones explicables. Pilotos: **Cancún** (principal) y **Ciudad de México** (prueba multicidad). Hackatón · repo creado desde cero el **20/11/2026**.

**No recorras `src/` entero.** Busca tu tarea en la tabla, abre la ruta y su documento. Nada más.

## Router: tarea → archivo

| Tarea | Ruta exacta | Contexto (leer) | Prueba |
|---|---|---|---|
| Pantallas, pestañas, layout | `apps/web/src/app/{App.jsx,layout/,navigation/,screens/}` | [screens](docs/03-design/screens.md), [ux-rules](docs/03-design/ux-rules.md) | `npm run check` + navegador 390px |
| Arquitectura, carpetas, recetas (módulo / feature / ciudad nueva) | — | [overview](docs/01-architecture/overview.md), [ADR-0003](docs/adr/0003-monolito-modular-features-adaptadores.md) | — |
| Mapa (MapLibre, estilo, capas) | `apps/web/src/features/map/CityMap.jsx` | [map](docs/02-modules/map.md) | navegador: mapa visible + atribución |
| Selector y datos de ciudad (web) | `apps/web/src/features/cities/` | [cities-and-transit](docs/02-modules/cities-and-transit.md) | cambiar Cancún ↔ CDMX |
| Catálogo de ciudades (API) | `apps/api/src/modules/cities/catalog.ts` | [cities-and-transit](docs/02-modules/cities-and-transit.md) | `npm test` |
| Transporte Cancún / CDMX | `apps/api/src/modules/transit/` *(crear, KH-003/KH-007)* | [cities-and-transit](docs/02-modules/cities-and-transit.md), [sources](docs/06-data/sources.md) | test de adaptador + ruta en mapa |
| POI Cancún y zonas | `apps/api/src/modules/discovery/` (POI KH-004; zonas KH-009), `scripts/fetch-osm-pois.mjs` | [discovery](docs/02-modules/discovery.md) | test del filtro; marcadores en KH-005 |
| Eventos | `apps/web/src/features/events/` (DEMO), `apps/api/src/modules/events/` *(crear, KH-014)* | [discovery](docs/02-modules/discovery.md), [contract](docs/04-api/contract.md) | test: solo eventos futuros |
| Adaptador por ciudad / ciudad nueva | `apps/api/src/shared/city-adapters.ts`, `modules/cities/catalog.ts` | [overview → recetas](docs/01-architecture/overview.md) | `npm test` |
| Incidencias / inundaciones | `apps/api/src/modules/reports/` *(crear, KH-008)* | [reports](docs/02-modules/reports.md), [data-policy](docs/06-data/data-policy.md) | test de caducidad |
| Presupuesto y gastos | `apps/web/src/features/budget/` *(crear, KH-010)* | [budget](docs/02-modules/budget.md) | test de cálculo en centavos |
| Carga de datos en la web (hook común) | `apps/web/src/shared/hooks/useResource.js` | [overview](docs/01-architecture/overview.md) | `npm run check` |
| Cliente HTTP web | `apps/web/src/shared/lib/http.js` | [contract](docs/04-api/contract.md) | estado de error con "Reintentar" |
| Montaje de rutas API | `apps/api/src/app.ts` | [contract](docs/04-api/contract.md) | `npm test` |
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

Requiere Node ≥ 22.12. PostgreSQL es opcional hasta que un módulo persista datos.

```bash
npm ci                      # instala con package-lock.json
npm run dev                 # API :3001 + web :5173 (Vite proxifica /api)
npm run check               # typecheck API + lint web + tests + enlaces de docs
npm run build               # compila API (dist/) y web (dist/)
# Opcional, con PostgreSQL:
cp apps/api/.env.example apps/api/.env   # y descomentar DATABASE_URL
docker compose up -d db && npm run db:migrate && npm run db:seed
npm run db:import-osm           # lugares reales de Cancún (Overpass); se puede repetir
```

## Stack (fijo, ver [ADR-0001](docs/adr/0001-monorepo.md)) y arquitectura ([ADR-0003](docs/adr/0003-monolito-modular-features-adaptadores.md))

React 19 + JSX + Tailwind 4 + Vite + `motion` (web; estilo "tarjeta de visita" y motion design, [ADR-0005](docs/adr/0005-tarjeta-de-visita-y-motion.md)) · Node + Express 5 + TypeScript (API) · PostgreSQL · MapLibre GL + OpenStreetMap · npm workspaces. Sin microservicios ni orquestadores.

## Estado (20/11/2026)

| Pieza | Estado |
|---|---|
| Monorepo, lockfile, `dev` / `check` / `build` / `test` / `db:migrate` | IMPLEMENTADO y verificado |
| API `/health`, `/api/cities`, `/api/cities/:cityId` con validación y errores tipados | IMPLEMENTADO (6 tests) |
| Web: selector Cancún ↔ CDMX, mapa MapLibre que vuela entre ciudades, estados carga/error/reintento | IMPLEMENTADO |
| Migración 0001 (ciudades, lugares, eventos, incidencias) | IMPLEMENTADO, probada en PostgreSQL 16 |
| POI Cancún: importación OSM y `GET /api/cities/:cityId/pois` | IMPLEMENTADO (KH-004). Ficha y marcadores: KH-005 |
| Transporte, zonas, eventos, incidencias, presupuesto, motor de decisiones | PLANIFICADO → [backlog](docs/05-delivery/backlog.md) |
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
