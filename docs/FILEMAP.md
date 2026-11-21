# FILEMAP — rutas reales (verificadas contra el código el 21/11/2026)

**Si creas o mueves una ruta, actualiza esta tabla y el router de `README.md` en el mismo commit.** Primera parada antes de cualquier búsqueda.

## Web (`apps/web`, React + JSX + Tailwind + Vite)
| Responsabilidad | Ruta | Estado |
|---|---|---|
| HTML de entrada, `<title>`, favicon | `apps/web/index.html`, `apps/web/public/favicon.svg` | IMPLEMENTADO |
| Entrypoint React | `apps/web/src/main.jsx` | IMPLEMENTADO |
| Composición (cabecera + pantalla de la pestaña + barra inferior) | `apps/web/src/app/App.jsx` | IMPLEMENTADO |
| Cabecera (marca, ciudad, perfil → ajustes), barra inferior, hoja de ajustes | `apps/web/src/app/layout/{AppHeader,BottomNav,SettingsSheet}.jsx` | IMPLEMENTADO |
| Pestañas y ruta en URL (`?tab=`, `&category=`) | `apps/web/src/app/navigation/{tabs.js,useRoute.js}` | IMPLEMENTADO |
| Chunks por pestaña y prefetch de la pestaña activa | `apps/web/src/app/{screens.js,prefetch.js}` | IMPLEMENTADO |
| Pantallas: Inicio, Explorar, Mapa, Billetera | `apps/web/src/app/screens/{HomeScreen,ExploreScreen,MapScreen,BudgetScreen}.jsx` | Inicio, Explorar (buscador de eventos, KH-005) y Mapa IMPLEMENTADO; Billetera vacío honesto |
| Fotos de eventos y lugares DEMO | `apps/web/public/demo/{events,places}/*.jpg` | IMPLEMENTADO (créditos en `docs/06-data/sources.md`) |
| Tokens Tailwind (`@theme`: tema oscuro, acento lima, semánticos, relieves, brillos, radios), utilidades `label`/`title`/`display`, variante `short:`, fuentes | `apps/web/src/index.css` | IMPLEMENTADO |
| Cliente HTTP (timeout, `ApiError`, aviso de 401, dedupe de GET) | `apps/web/src/shared/lib/http.js` | IMPLEMENTADO |
| Sesión y pantalla de login | `apps/web/src/features/auth/` | IMPLEMENTADO (KH-019) |
| Idiomas: textos ES/EN (única fuente de texto visible) | `apps/web/src/shared/i18n/locales/{es,en}.json` | IMPLEMENTADO |
| Idiomas: proveedor, `useI18n`, selector ES/EN, detección | `apps/web/src/shared/i18n/{i18n.js,I18nContext.js,I18nProvider.jsx,LanguageSwitcher.jsx,index.js}` | IMPLEMENTADO |
| Movimiento: vocabulario y scroll que sigue a una expansión | `apps/web/src/shared/motion/{motion.js,useRevealScroll.js}` | IMPLEMENTADO |
| Hook de carga común `{status, data, error, reload}` | `apps/web/src/shared/hooks/useResource.js` | IMPLEMENTADO |
| Estados de carga, error con "Reintentar" y vacío | `apps/web/src/shared/components/{LoadingState,ErrorState,EmptyState}.jsx` | IMPLEMENTADO |
| Foto DEMO responsive (AVIF/WebP + JPEG) | `apps/web/src/shared/components/Photo.jsx`, `shared/lib/demoImage.js` | IMPLEMENTADO |
| Hoja inferior / diálogo reutilizable | `apps/web/src/shared/components/Sheet.jsx` | IMPLEMENTADO |
| Etiqueta REAL/DEMO/UNVERIFIED y estrellas de calificación | `apps/web/src/shared/components/{DataStatusBadge,StarRating}.jsx` | IMPLEMENTADO |
| Ciudades: servicio, hooks, selector, ciudad activa en `?city=`, estado de capas | `apps/web/src/features/cities/{cities.api.js,useCities.js,useSelectedCity.js,CityPicker.jsx,ModuleStatusList.jsx,index.js}` | IMPLEMENTADO |
| Mapa MapLibre | `apps/web/src/features/map/{CityMap,MapView,DataLayers,EventPins,LayerPanel,MapControls,MapItems}.jsx`, `useMapData.js`, `useGeolocation.js`, `geo.js` (+ tests), `useGeoJsonLayer.js`, `mapTheme.js`, `MapMarker.jsx` (+ `index.js`) | IMPLEMENTADO |
| Transporte (API web y crédito GTFS) | `apps/web/src/features/transit/` | IMPLEMENTADO; líneas y paradas en `DataLayers` (KH-006/KH-007) |
| Categorías y tarjetas rápidas de Inicio | `apps/web/src/features/discovery/{categories.js,CategoryGrid.jsx,HomeSpotCards.jsx}` | IMPLEMENTADO |
| POI: búsqueda/ficha (`PlaceResults`, `PlaceDetailSheet`, etiqueta de foto ilustrativa `IllustrativePhotoTag` + `photo.js`, `usePois`, `pois.api.js`, `searchPois.js` + test), crédito ODbL y zonas | `apps/web/src/features/discovery/` | Búsqueda/ficha IMPLEMENTADO (KH-005); mapa KH-006 |
| Eventos: tira de días, tarjetas (bento y fila), sección, detalle, buscador de Explorar (`EventSearch`, lógica pura en `search.js` + test), HTTP a la API, fechas por zona horaria | `apps/web/src/features/events/` | IMPLEMENTADO (BD + DEMO) |
| Incidencias | `apps/web/src/features/reports/` | PLANIFICADO (KH-012) |
| Presupuesto local MXN, gastos, historial, gráfico, CSV y tests | `apps/web/src/features/budget/` | IMPLEMENTADO (KH-010, en revisión) |
| Prueba de que no hay scroll horizontal (todas las pantallas) | `e2e/overflow.spec.js` + `playwright.config.js` | IMPLEMENTADO (KH-022); `npm run test:overflow` con la app en marcha y `AUTH_DEV_LOGIN=true` |
| Config Vite (alias `@`, proxy `/api`, chunks, caché de `/assets/`, fotos DEMO) | `apps/web/vite.config.js`, `apps/web/demo-images.js` | IMPLEMENTADO |
| Lint (reglas de arquitectura + a11y) | `apps/web/eslint.config.js` | IMPLEMENTADO |
| Producto (impeccable) y brief de la pantalla de inicio | `apps/web/PRODUCT.md`, `apps/web/.impeccable/surfaces/` | IMPLEMENTADO |
| Variables públicas | `apps/web/.env.example` | IMPLEMENTADO |

## API (`apps/api`, Express 5 + TypeScript)
| Responsabilidad | Ruta | Estado |
|---|---|---|
| Arranque (puerto, `.env`) | `apps/api/src/server.ts` | IMPLEMENTADO |
| Montaje de middlewares y routers (sesión obligatoria en `/api`) | `apps/api/src/app.ts` | IMPLEMENTADO |
| Autenticación: Google OAuth + PKCE, express-session en PostgreSQL, usuarios, límite de intentos por IP (`rate-limit.ts` y test) | `apps/api/src/modules/auth/` | IMPLEMENTADO (KH-019) |
| Cabeceras de seguridad y control de origen (CSRF) | `apps/api/src/shared/security.ts` | IMPLEMENTADO |
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
| Transporte (`GET /transit`: Cancún rutas simuladas DEMO `cancun.adapter.ts` + `adapters/cancun-demo.ts`; lectura en vivo desactivada en `adapters/cancun-live.ts` + `cancun-live.test.ts`; CDMX snapshot `adapters/cdmx.ts` + `transit.db.ts`) | `apps/api/src/modules/transit/` | Cancún DEMO ([ADR-0008](adr/0008-rutas-cancun-simuladas-fotos-demo-kinhop.md)); CDMX IMPLEMENTADO (KH-007) |
| POI Cancún (`GET /pois`) y zonas (`GET /districts`) | `apps/api/src/modules/discovery/` | IMPLEMENTADO: POI (KH-004) y alcaldías CDMX (KH-009). Supermanzanas de Cancún sin fuente |
| Eventos | `apps/api/src/modules/events/` | IMPLEMENTADO (KH-014) |
| Incidencias: GET/POST, confirmar, moderación | `apps/api/src/modules/reports/` | IMPLEMENTADO (KH-011) |
| Motor de decisiones (`suggest`, SQL, `GET /suggestions`) | `apps/api/src/modules/decisions/` | IMPLEMENTADO (KH-013); regla de gasto local KH-020 |
| Alternativa local en la ficha (gasto local, KH-020) | `apps/web/src/features/discovery/{LocalAlternative.jsx,suggestions.api.js}` | IMPLEMENTADO |
| Medidor de gasto local | `apps/web/src/features/budget/LocalSpendMeter.jsx` | IMPLEMENTADO (KH-020) |
| Migración negocios locales vs cadenas | `db/migrations/0008_places_local_business.sql` | IMPLEMENTADO (KH-020) |
| Monetización: Pro, cupones con QR, anuncios, eventos patrocinados, ofertas a negocios | `apps/web/src/features/monetization/`, `apps/api/src/modules/coupons/` | IMPLEMENTADO (KH-021, simulado) |
| Ángulo, rúbrica y plan del hackatón · guion del pitch | `HACKATHON.md`, `PITCH.md` | 21/11/2026 |
| Variables | `apps/api/.env.example` | IMPLEMENTADO |
| TS config | `apps/api/tsconfig.json` | IMPLEMENTADO |

## Raíz
| Responsabilidad | Ruta | Estado |
|---|---|---|
| Scripts del monorepo | `package.json`, `package-lock.json` | IMPLEMENTADO |
| Migraciones SQL | `db/migrations/{0001_init,0002_mvp_schema,0003_source_id_not_null,0004_ratings,0005_place_images,0006_varied_place_images}.sql` | IMPLEMENTADO |
| Seeds (catálogo + DEMO) | `db/seeds/*.sql`, runner `apps/api/src/shared/seed.ts` (`npm run db:seed`) | IMPLEMENTADO |
| Tests del esquema (necesitan PostgreSQL) | `apps/api/src/shared/db.schema.test.ts` | IMPLEMENTADO |
| Diccionario de datos y diagrama | `docs/06-data/database.md` | IMPLEMENTADO |
| PostgreSQL local | `docker-compose.yml` | IMPLEMENTADO |
| CI | `.github/workflows/ci.yml` | IMPLEMENTADO |
| Plantilla de PR | `.github/pull_request_template.md` | IMPLEMENTADO |
| Flujo de Git: solo PRs hacia `developers` | `docs/agent/FLUJO_GIT.md` | IMPLEMENTADO |
| Validador de enlaces de docs | `scripts/check-doc-links.mjs` | IMPLEMENTADO |
| Importar POI de OpenStreetMap (Cancún) | `scripts/fetch-osm-pois.mjs`, recorte `scripts/fixtures/overpass-cancun-sample.json` | IMPLEMENTADO (KH-004) |
| Importar GTFS de CDMX (Metrobús línea 1) | `scripts/import-cdmx-gtfs.mjs`, recorte `scripts/fixtures/cdmx-gtfs/` | IMPLEMENTADO (KH-007) |
| Validador de idiomas (claves, variables, usos de `t()`) | `scripts/check-i18n.mjs` | IMPLEMENTADO |
| E2E: sin desborde horizontal 320–430 px | `e2e/overflow.spec.js`, `playwright.config.js` (`npm run test:overflow`) | IMPLEMENTADO (KH-022) |
| Imágenes del README (capturas reales, hero y animación) | `docs/assets/readme/*.webp` | IMPLEMENTADO (KH-025) |

Último recurso: `git ls-files apps/web/src/features/<dominio>` limitado al módulo; nunca búsquedas globales sin agotar README y este archivo.

## Video para el jurado (KH-017)

| Responsabilidad | Ruta | Estado |
|---|---|---|
| Composición HyperFrames, capturas y revisión | `video/demo-jurado/{index.html,storyboard.json,assets/,SPEC.md,REVIEW.md,README.md}` | IMPLEMENTADO: apoyo visual de 300 s + PITCH.md de 635 palabras, 1080p/30 fps |
| Discurso listo para aprender | `docs/05-delivery/kinhop-speech-5min.md`, `PITCH.md` | 635 palabras, tiempos, ensayo y respuestas al jurado |
| Archivo de reproducción sin red | `docs/05-delivery/kinhop-demo-jurado.mp4` | Render MP4 H.264, sin audio para acompañar el pitch |
