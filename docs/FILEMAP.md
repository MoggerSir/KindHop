# FILEMAP — rutas reales (verificadas contra el código el 20/11/2026)

**Si creas o mueves una ruta, actualiza esta tabla y el router de `README.md` en el mismo commit.** Primera parada antes de cualquier búsqueda.

## Web (`apps/web`, React + JSX + Tailwind + Vite)
| Responsabilidad | Ruta | Estado |
|---|---|---|
| HTML de entrada, `<title>`, favicon | `apps/web/index.html`, `apps/web/public/favicon.svg` | IMPLEMENTADO |
| Entrypoint React | `apps/web/src/main.jsx` | IMPLEMENTADO |
| Composición (cabecera + pantalla de la pestaña + barra inferior) | `apps/web/src/app/App.jsx` | IMPLEMENTADO |
| Cabecera (marca, ciudad, perfil → ajustes), barra inferior, hoja de ajustes | `apps/web/src/app/layout/{AppHeader,BottomNav,SettingsSheet}.jsx` | IMPLEMENTADO |
| Pestañas y ruta en URL (`?tab=`, `&category=`) | `apps/web/src/app/navigation/{tabs.js,useRoute.js}` | IMPLEMENTADO |
| Pantallas: Inicio, Explorar, Mapa, Billetera | `apps/web/src/app/screens/{HomeScreen,ExploreScreen,MapScreen,BudgetScreen}.jsx` | Inicio y Mapa IMPLEMENTADO; Explorar y Billetera vacío honesto |
| Fotos de eventos DEMO | `apps/web/public/demo/events/*.jpg` | IMPLEMENTADO (créditos en `docs/06-data/sources.md`) |
| Tokens Tailwind (`@theme`: tema oscuro, acento lima, semánticos, relieves, brillos, radios), utilidades `label`/`title`/`display`, variante `short:`, fuentes | `apps/web/src/index.css` | IMPLEMENTADO |
| Cliente HTTP (timeout, `ApiError`) | `apps/web/src/shared/lib/http.js` | IMPLEMENTADO |
| Idiomas: textos ES/EN (única fuente de texto visible) | `apps/web/src/shared/i18n/locales/{es,en}.json` | IMPLEMENTADO |
| Idiomas: proveedor, `useI18n`, selector ES/EN, detección | `apps/web/src/shared/i18n/{i18n.js,I18nContext.js,I18nProvider.jsx,LanguageSwitcher.jsx,index.js}` | IMPLEMENTADO |
| Movimiento: vocabulario y scroll que sigue a una expansión | `apps/web/src/shared/motion/{motion.js,useRevealScroll.js}` | IMPLEMENTADO |
| Hook de carga común `{status, data, error, reload}` | `apps/web/src/shared/hooks/useResource.js` | IMPLEMENTADO |
| Estados de carga, error con "Reintentar" y vacío | `apps/web/src/shared/components/{LoadingState,ErrorState,EmptyState}.jsx` | IMPLEMENTADO |
| Hoja inferior / diálogo reutilizable | `apps/web/src/shared/components/Sheet.jsx` | IMPLEMENTADO |
| Etiqueta REAL/DEMO/UNVERIFIED | `apps/web/src/shared/components/DataStatusBadge.jsx` | IMPLEMENTADO |
| Ciudades: servicio, hooks, selector, ciudad activa en `?city=`, estado de capas | `apps/web/src/features/cities/{cities.api.js,useCities.js,useSelectedCity.js,CityPicker.jsx,ModuleStatusList.jsx,index.js}` | IMPLEMENTADO |
| Mapa MapLibre | `apps/web/src/features/map/{CityMap,MapView,DataLayers,EventPins,LayerPanel,MapControls,MapItems}.jsx`, `useMapData.js`, `useGeolocation.js`, `geo.js` (+ tests), `useGeoJsonLayer.js`, `mapTheme.js`, `MapMarker.jsx` (+ `index.js`) | IMPLEMENTADO |
| Transporte (capa) | `apps/web/src/features/transit/` | PLANIFICADO (KH-006) |
| Categorías de exploración | `apps/web/src/features/discovery/{categories.js,CategoryGrid.jsx}` | IMPLEMENTADO |
| Atribución ODbL de lugares y mapa | `apps/web/src/features/discovery/OsmAttribution.jsx` | IMPLEMENTADO (KH-004) |
| POI (marcadores y ficha) y zonas | `apps/web/src/features/discovery/` | PLANIFICADO (KH-005, KH-009) |
| Eventos: tira de días, tarjetas, sección, detalle, HTTP a la API, fechas por zona horaria | `apps/web/src/features/events/` | IMPLEMENTADO (BD + DEMO) |
| Incidencias | `apps/web/src/features/reports/` | PLANIFICADO (KH-012) |
| Presupuesto | `apps/web/src/features/budget/` | PLANIFICADO (KH-010) |
| Config Vite (alias `@`, proxy `/api`) | `apps/web/vite.config.js` | IMPLEMENTADO |
| Lint (reglas de arquitectura + a11y) | `apps/web/eslint.config.js` | IMPLEMENTADO |
| Producto (impeccable) y brief de la pantalla de inicio | `apps/web/PRODUCT.md`, `apps/web/.impeccable/surfaces/` | IMPLEMENTADO |
| Variables públicas | `apps/web/.env.example` | IMPLEMENTADO |

## API (`apps/api`, Express 5 + TypeScript)
| Responsabilidad | Ruta | Estado |
|---|---|---|
| Arranque (puerto, `.env`) | `apps/api/src/server.ts` | IMPLEMENTADO |
| Montaje de middlewares y routers | `apps/api/src/app.ts` | IMPLEMENTADO |
| `AppError`, 404 y manejador de errores | `apps/api/src/shared/errors.ts` | IMPLEMENTADO |
| Carga de `.env` | `apps/api/src/shared/env.ts` | IMPLEMENTADO |
| Conexión PostgreSQL (`query`, `requireDatabase`, health BD) | `apps/api/src/shared/db.ts` | IMPLEMENTADO |
| Runner de migraciones | `apps/api/src/shared/migrate.ts` | IMPLEMENTADO |
| Catálogo y config por ciudad | `apps/api/src/modules/cities/catalog.ts` | IMPLEMENTADO |
| Rutas `/api/cities` | `apps/api/src/modules/cities/routes.ts` | IMPLEMENTADO |
| Validar `:cityId` en cualquier módulo | `apps/api/src/modules/cities/require-city.ts` | IMPLEMENTADO |
| API pública del módulo cities | `apps/api/src/modules/cities/index.ts` | IMPLEMENTADO |
| Elegir adaptador por ciudad (`pickAdapter`) | `apps/api/src/shared/city-adapters.ts` (+ `.test.ts`) | IMPLEMENTADO |
| Tests de API | `apps/api/src/app.test.ts` (`*.test.ts` junto al módulo) | IMPLEMENTADO |
| Transporte Cancún (lectura en vivo, sin BD) | `apps/api/src/modules/transit/{cancun.adapter.ts,routes.ts,transit.test.ts}` | IMPLEMENTADO (KH-003). CDMX y la capa del mapa: KH-007, KH-006 |
| POI Cancún (`GET /pois`) y zonas (`GET /districts`) | `apps/api/src/modules/discovery/` | IMPLEMENTADO: POI (KH-004) y alcaldías CDMX (KH-009). Supermanzanas de Cancún sin fuente |
| Eventos | `apps/api/src/modules/events/` | IMPLEMENTADO (KH-014) |
| Incidencias: GET/POST, confirmar, moderación | `apps/api/src/modules/reports/` | IMPLEMENTADO (KH-011) |
| Motor de decisiones (`suggest`, SQL, `GET /suggestions`) | `apps/api/src/modules/decisions/` | IMPLEMENTADO (API, KH-013); la UI sigue PLANIFICADO |
| Variables | `apps/api/.env.example` | IMPLEMENTADO |
| TS config | `apps/api/tsconfig.json` | IMPLEMENTADO |

## Raíz
| Responsabilidad | Ruta | Estado |
|---|---|---|
| Scripts del monorepo | `package.json`, `package-lock.json` | IMPLEMENTADO |
| Migraciones SQL | `db/migrations/{0001_init,0002_mvp_schema,0003_source_id_not_null}.sql` | IMPLEMENTADO |
| Seeds (catálogo + DEMO) | `db/seeds/*.sql`, runner `apps/api/src/shared/seed.ts` (`npm run db:seed`) | IMPLEMENTADO |
| Tests del esquema (necesitan PostgreSQL) | `apps/api/src/shared/db.schema.test.ts` | IMPLEMENTADO |
| Diccionario de datos y diagrama | `docs/06-data/database.md` | IMPLEMENTADO |
| PostgreSQL local | `docker-compose.yml` | IMPLEMENTADO |
| CI | `.github/workflows/ci.yml` | IMPLEMENTADO |
| Plantilla de PR | `.github/pull_request_template.md` | IMPLEMENTADO |
| Flujo de Git: solo PRs hacia `developers` | `docs/agent/FLUJO_GIT.md` | IMPLEMENTADO |
| Validador de enlaces de docs | `scripts/check-doc-links.mjs` | IMPLEMENTADO |
| Importar POI de OpenStreetMap (Cancún) | `scripts/fetch-osm-pois.mjs`, recorte `scripts/fixtures/overpass-cancun-sample.json` | IMPLEMENTADO (KH-004) |
| Validador de idiomas (claves, variables, usos de `t()`) | `scripts/check-i18n.mjs` | IMPLEMENTADO |
| E2E | `e2e/` | PLANIFICADO (KH-008) |

Último recurso: `git ls-files apps/web/src/features/<dominio>` limitado al módulo; nunca búsquedas globales sin agotar README y este archivo.
