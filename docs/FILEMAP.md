# FILEMAP — rutas reales (verificadas contra el código el 20/11/2026)

**Si creas o mueves una ruta, actualiza esta tabla y el router de `README.md` en el mismo commit.** Primera parada antes de cualquier búsqueda.

## Web (`apps/web`, React + JSX + Tailwind + Vite)
| Responsabilidad | Ruta | Estado |
|---|---|---|
| HTML de entrada, `<title>`, favicon | `apps/web/index.html`, `apps/web/public/favicon.svg` | IMPLEMENTADO |
| Entrypoint React | `apps/web/src/main.jsx` | IMPLEMENTADO |
| Pantalla principal (composición) | `apps/web/src/app/App.jsx` | IMPLEMENTADO |
| Lista de estado de capas por ciudad | `apps/web/src/app/ModuleStatusList.jsx` | IMPLEMENTADO |
| Tokens Tailwind (`@theme`), estilos globales, reduced-motion | `apps/web/src/index.css` | IMPLEMENTADO |
| Cliente HTTP (timeout, `ApiError`) | `apps/web/src/shared/lib/http.js` | IMPLEMENTADO |
| Etiqueta REAL/DEMO/UNVERIFIED | `apps/web/src/shared/components/DataStatusBadge.jsx` | IMPLEMENTADO (sin uso aún) |
| Ciudades: servicio, hook, selector | `apps/web/src/features/cities/{cities.api.js,useCities.js,CitySwitcher.jsx,index.js}` | IMPLEMENTADO |
| Mapa MapLibre | `apps/web/src/features/map/CityMap.jsx` (+ `index.js`) | IMPLEMENTADO |
| Transporte (capa) | `apps/web/src/features/transit/` | PLANIFICADO (KH-006) |
| POI y eventos | `apps/web/src/features/discovery/` | PLANIFICADO (KH-005, KH-014) |
| Incidencias | `apps/web/src/features/reports/` | PLANIFICADO (KH-012) |
| Presupuesto | `apps/web/src/features/budget/` | PLANIFICADO (KH-010) |
| Config Vite (alias `@`, proxy `/api`) | `apps/web/vite.config.js` | IMPLEMENTADO |
| Lint (reglas de arquitectura + a11y) | `apps/web/eslint.config.js` | IMPLEMENTADO |
| Variables públicas | `apps/web/.env.example` | IMPLEMENTADO |

## API (`apps/api`, Express 5 + TypeScript)
| Responsabilidad | Ruta | Estado |
|---|---|---|
| Arranque (puerto, `.env`) | `apps/api/src/server.ts` | IMPLEMENTADO |
| Montaje de middlewares y routers | `apps/api/src/app.ts` | IMPLEMENTADO |
| `AppError`, 404 y manejador de errores | `apps/api/src/shared/errors.ts` | IMPLEMENTADO |
| Carga de `.env` | `apps/api/src/shared/env.ts` | IMPLEMENTADO |
| Conexión PostgreSQL (pool perezoso) | `apps/api/src/shared/db.ts` | IMPLEMENTADO |
| Runner de migraciones | `apps/api/src/shared/migrate.ts` | IMPLEMENTADO |
| Catálogo y config por ciudad | `apps/api/src/modules/cities/catalog.ts` | IMPLEMENTADO |
| Rutas `/api/cities` | `apps/api/src/modules/cities/routes.ts` | IMPLEMENTADO |
| Tests de API | `apps/api/src/app.test.ts` (`*.test.ts` junto al módulo) | IMPLEMENTADO |
| Transporte (adaptadores Cancún/CDMX) | `apps/api/src/modules/transit/` | PLANIFICADO (KH-003, KH-007) |
| POI / eventos | `apps/api/src/modules/discovery/` | PLANIFICADO (KH-004, KH-014) |
| Incidencias | `apps/api/src/modules/reports/` | PLANIFICADO (KH-011) |
| Motor de decisiones | `apps/api/src/modules/decisions/` | PLANIFICADO (KH-013) |
| Variables | `apps/api/.env.example` | IMPLEMENTADO |
| TS config | `apps/api/tsconfig.json` | IMPLEMENTADO |

## Raíz
| Responsabilidad | Ruta | Estado |
|---|---|---|
| Scripts del monorepo | `package.json`, `package-lock.json` | IMPLEMENTADO |
| Migraciones SQL | `db/migrations/0001_init.sql` | IMPLEMENTADO |
| PostgreSQL local | `docker-compose.yml` | IMPLEMENTADO |
| CI | `.github/workflows/ci.yml` | IMPLEMENTADO |
| Plantilla de PR | `.github/pull_request_template.md` | IMPLEMENTADO |
| Validador de enlaces de docs | `scripts/check-doc-links.mjs` | IMPLEMENTADO |
| E2E | `e2e/` | PLANIFICADO (KH-008) |

Último recurso: `git ls-files apps/web/src/features/<dominio>` limitado al módulo; nunca búsquedas globales sin agotar README y este archivo.
