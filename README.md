# KindHop

> Plataforma mobile-first de inteligencia urbana: movilidad, lugares, incidencias, eventos y presupuesto de viaje en un mapa, con decisiones explicables. Pilotos: **Cancún** (principal) y **Ciudad de México** (prueba multicidad). Hackatón · repo creado desde cero el **20/11/2026**.

**No recorras `src/` entero.** Busca tu tarea en la tabla, abre la ruta y su documento. Nada más.

## Router: tarea → archivo

| Tarea | Ruta exacta | Contexto (leer) | Prueba |
|---|---|---|---|
| Pantalla principal / layout | `apps/web/src/app/App.jsx` | [ux-rules](docs/03-design/ux-rules.md) | `npm run check` + navegador 390px |
| Mapa (MapLibre, estilo, capas) | `apps/web/src/features/map/CityMap.jsx` | [map](docs/02-modules/map.md) | navegador: mapa visible + atribución |
| Selector y datos de ciudad (web) | `apps/web/src/features/cities/` | [cities-and-transit](docs/02-modules/cities-and-transit.md) | cambiar Cancún ↔ CDMX |
| Catálogo de ciudades (API) | `apps/api/src/modules/cities/catalog.ts` | [cities-and-transit](docs/02-modules/cities-and-transit.md) | `npm test` |
| Transporte Cancún / CDMX | `apps/api/src/modules/transit/` *(crear, KH-003/KH-005)* | [cities-and-transit](docs/02-modules/cities-and-transit.md), [sources](docs/06-data/sources.md) | test de adaptador + ruta en mapa |
| POI y zonas | `apps/api/src/modules/discovery/` *(crear, KH-004)* | [discovery](docs/02-modules/discovery.md) | test + marcador con fuente |
| Incidencias / inundaciones | `apps/api/src/modules/reports/` *(crear, KH-008)* | [reports](docs/02-modules/reports.md), [data-policy](docs/06-data/data-policy.md) | test de caducidad |
| Presupuesto y gastos | `apps/web/src/features/budget/` *(crear, KH-010)* | [budget](docs/02-modules/budget.md) | test de cálculo en centavos |
| Cliente HTTP web | `apps/web/src/shared/lib/http.js` | [contract](docs/04-api/contract.md) | estado de error con "Reintentar" |
| Montaje de rutas API | `apps/api/src/app.ts` | [contract](docs/04-api/contract.md) | `npm test` |
| Errores API | `apps/api/src/shared/errors.ts` | [contract](docs/04-api/contract.md) | `npm test` |
| PostgreSQL / migraciones | `apps/api/src/shared/db.ts`, `db/migrations/` | [db/README](db/README.md) | `npm run db:migrate` (2 veces: idempotente) |
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
docker compose up -d db && npm run db:migrate
```

## Stack (fijo, ver [ADR-0001](docs/adr/0001-monorepo.md))

React 19 + JSX + Tailwind 4 + Vite (web) · Node + Express 5 + TypeScript (API) · PostgreSQL · MapLibre GL + OpenStreetMap · npm workspaces. Sin microservicios ni orquestadores.

## Estado (20/11/2026)

| Pieza | Estado |
|---|---|
| Monorepo, lockfile, `dev` / `check` / `build` / `test` / `db:migrate` | IMPLEMENTADO y verificado |
| API `/health`, `/api/cities`, `/api/cities/:cityId` con validación y errores tipados | IMPLEMENTADO (6 tests) |
| Web: selector Cancún ↔ CDMX, mapa MapLibre que vuela entre ciudades, estados carga/error/reintento | IMPLEMENTADO |
| Migración 0001 (ciudades, lugares, eventos, incidencias) | IMPLEMENTADO, probada en PostgreSQL 16 |
| Transporte, POI, zonas, eventos, incidencias, presupuesto, motor de decisiones | PLANIFICADO → [backlog](docs/05-delivery/backlog.md) |
| Fuentes de datos reales | POR VALIDAR → [sources](docs/06-data/sources.md) |

## Reglas de oro

1. **Repo nuevo:** no copiar código ni historial de Larpatron ni de Rutas Cancún. La API de Rutas Cancún se consume como servicio externo **declarado** (ver [OPEN-QUESTIONS](docs/OPEN-QUESTIONS.md)).
2. **Datos honestos:** todo dato lleva `REAL` / `DEMO` / `USER_REPORTED` / `UNVERIFIED`, fuente y fecha. Nada se presenta como "en vivo" si no lo es.
3. **Finanzas honestas:** gasto manual/CSV; nunca tarjeta, CVV ni credenciales; no Google Wallet/Pay.
4. **Vertical slice:** UI + API + datos + error + prueba, uno a la vez. `main` siempre demostrable.
5. **Si cambias una ruta,** actualiza esta tabla y `docs/FILEMAP.md` en el mismo commit.

Licencia: pendiente de decisión del equipo ([LICENSE-NOTICE](LICENSE-NOTICE.md)).
