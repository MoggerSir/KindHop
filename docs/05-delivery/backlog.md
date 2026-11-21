# Backlog KindHop — Kanban `TODO → DOING → REVIEW → DONE`

Reglas: WIP 1 por agente · una tarjeta = un resultado observable · nada pasa a `DONE` sin evidencia (comando, captura o test) · las asignaciones son **por rol** hasta que el equipo ponga nombres. Roles y zonas de archivos: [`../agent/WORKFLOW.md`](../agent/WORKFLOW.md).

**Contrato primero:** si una tarjeta frontend depende de un endpoint aún no hecho, se trabaja contra el contrato de [`../04-api/contract.md`](../04-api/contract.md) con un fixture marcado `DEMO`, y se conecta al real al cerrar la tarjeta backend.

## Tablero

| ID | Prio | Estado | Rol | Depende de | Título |
|---|---|---|---|---|---|
| KH-001 | P0 | DONE | integrador | — | Bootstrap monorepo, API base, mapa, CI |
| KH-002 | P0 | TODO | integración | — | Validar reglas del evento + acceso a API Rutas Cancún |
| KH-003 | P0 | REVIEW | backend | KH-002 | Adaptador transporte Cancún → `GET /transit` |
| KH-004 | P0 | REVIEW | datos | — | POI reales de Cancún (OSM snapshot) → `GET /pois` |
| KH-005 | P0 | REVIEW | frontend | contrato `/pois` | Capa POI + ficha inferior con fuente |
| KH-006 | P0 | REVIEW | frontend | contrato `/transit` | Capa de transporte en el mapa |
| KH-007 | P0 | REVIEW | datos | — | CDMX: 1 línea de transporte GTFS (POI de CDMX sigue pendiente) |
| KH-008 | P0 | TODO | QA | KH-005 | E2E Playwright del flujo de demo en CI |
| KH-009 | P1 | REVIEW | datos | — | Zonas: alcaldías CDMX (REAL); Cancún sin fuente verificada |
| KH-010 | P1 | REVIEW | frontend (Codex) | — | Presupuesto local-first con gráfico por categoría |
| KH-011 | P1 | REVIEW | backend | KH-018 | Incidencias: API con caducidad y estados |
| KH-012 | P1 | TODO | frontend | KH-011 | Incidencias: capa + formulario + etiqueta DEMO |
| KH-013 | P1 | REVIEW | backend | KH-004, KH-011 | Motor de decisiones: consultas y GET /suggestions (falta la UI) |
| KH-014 | P1 | REVIEW | backend + frontend | KH-018 | Tablón de eventos futuros con fuente |
| KH-015 | P1 | REVIEW | frontend | KH-005 | Navegación móvil y rediseño UI tema oscuro y lima según maqueta |
| KH-016 | P1 | TODO | integrador | KH-008 | Despliegue de demo (web + API) |
| KH-017 | P0 | REVIEW | QA / pitch (Codex: video) | KH-008 | Guion de demo, video de respaldo, judge-sim |
| KH-018 | P0 | REVIEW | datos | — | Esquema completo del MVP, seeds DEMO y diccionario de datos (issues #2–#11) |
| KH-019 | P0 | REVIEW | backend + frontend (Codex) | KH-018 | Login Google, sesiones y límites por IP |
| KH-020 | P0 | REVIEW | fullstack | KH-018 | Gasto local: alternativa local explicada y medidor en la Billetera |
| KH-021 | P1 | REVIEW | fullstack | KH-019 | Monetización: Pro con cupones y QR (simulado), anuncios y eventos patrocinados etiquetados |
| KH-022 | P0 | REVIEW | frontend | — | Responsive sin scroll horizontal en todas las pantallas (Explorar, Mapa, Login, fichas; shell, Billetera e Inicio) |
| KH-023 | P1 | REVIEW | frontend | — | Carga inicial en móvil (code-splitting, imágenes, fuentes, peticiones) |
| KH-024 | P1 | REVIEW | frontend | — | Fluidez en uso: scroll, animaciones, interacción y mapa |

**Bloqueado (P2, no tomar hasta que P0+P1 estén en `DONE`):** más ciudades, IA/LLM, open finance, recomendaciones predictivas, estadísticas institucionales, modo offline real. (La autenticación se adelantó: KH-019, [ADR-0009](../adr/0009-autenticacion-google-sesiones.md).)

## Tarjetas

### KH-018 · Base de datos del MVP — REVIEW
- **Zona:** `db/migrations/0002_mvp_schema.sql`, `db/migrations/0003_source_id_not_null.sql`, `db/seeds/`, `apps/api/src/shared/{seed.ts,db.schema.test.ts}`, `docs/06-data/database.md`, ADR-0006.
- **Evidencia:** migraciones y seeds aplicados 2 veces en PostgreSQL 17; 5 tests del esquema en verde; CI corre seeds y tests contra PostgreSQL.
- **Pendiente:** issues [#2–#11](https://github.com/MoggerSir/KindHop/issues?q=label%3Abase-de-datos) (etiqueta `base-de-datos`).

### KH-001 · Bootstrap — DONE
Evidencia: `npm ci`, `npm run check` (6 tests API), `npm run build`, `npm run db:migrate` ×2 en PostgreSQL 16, Playwright: selector Cancún↔CDMX y estado de error con reintento. Commit del 20/11/2026.

### KH-002 · Validar reglas del evento + API Rutas Cancún
- **Valor:** desbloquea legalmente la pieza central de la demo.
- **Hecho en KH-003 (21/11):** URL, formato, licencia y disponibilidad quedaron en [cities-and-transit](../02-modules/cities-and-transit.md) y [sources](../06-data/sources.md). OPEN-QUESTIONS #2 cerrada. El catálogo público respondió 200.
- **Sigue abierto:** OPEN-QUESTIONS #1. El repo no nombra el reglamento del evento; no se cierra con las reglas de otro hackatón.
- **Aceptación:** OPEN-QUESTIONS #1 y #2 cerradas con evidencia (enlace/cita); `curl` real a un endpoint documentado.
- **Fallback:** si no se permite, KH-003 usa un dataset abierto de rutas o se muestra "transporte no disponible". **Decisión 21/11 ([ADR-0008](../adr/0008-rutas-cancun-simuladas-fotos-demo-kinhop.md)):** mientras KH-002 no confirme, la demo usa rutas simuladas DEMO (sin tarifa ni horario) y el adaptador en vivo queda desactivado. KH-003 ya degradó a "no disponible" si la fuente cae, sin inventar rutas.

### KH-003 · Adaptador transporte Cancún — REVIEW
- **Valor:** el turista ve cómo llegar en transporte público real.
- **Decisión:** opción A (lectura en vivo, caché 60 s). Los términos no permiten guardar copia. Detalle en [cities-and-transit](../02-modules/cities-and-transit.md).
- **Zona:** `apps/api/src/modules/transit/` (`routes.ts`, `cancun.adapter.ts`, `transit.test.ts`), una línea en `apps/api/src/app.ts`.
- **Hecho:** `GET /api/cities/:cityId/transit` → `{ routes, source }`; timeout 4 s; 502 `TRANSIT_UNAVAILABLE` si la fuente falla; CDMX 404 `MODULE_UNAVAILABLE`. Sin paradas inventadas. `retrievedAt` = `generado` del volcado (2026-09-06).
- **Aceptación:** test con el recorte grabado + test de fallo, sin red en CI. La comprobación contra la URL real va aparte (`RUTAS_CANCUN_LIVE=1`).
- **Evidencia (21/11, PostgreSQL 17.12):** `npm run check` y `npm run build` en verde. `db:migrate` ×2 y `db:seed` ×2. `npm test -w @kindhop/api` con `DATABASE_URL` ×2: 59 tests, 0 fallos (en paralelo; `transit_routes` sigue en 0). `GET /api/cities/cancun/transit` contra el catálogo real: 34 rutas, `LineString`, `stops: []`, `fareCents` 1000 en la primera, `retrievedAt` `2026-09-06T06:36:11.927Z`, `dataStatus: REAL`. CDMX: 404 `MODULE_UNAVAILABLE`. Sin `DATABASE_URL` el endpoint de Cancún responde igual.
- **Pendiente:** la capa en el mapa (KH-006) y que el equipo confirme el reglamento del evento (OPEN-QUESTIONS #1).

### KH-004 · POI reales de Cancún — REVIEW
- **Zona:** `scripts/fetch-osm-pois.mjs`, `scripts/fixtures/overpass-cancun-sample.json`, `apps/api/src/modules/discovery/`, crédito en `apps/web/src/features/discovery/OsmAttribution.jsx`.
- **Tarea:** consulta Overpass acotada (playas, museos, parques, mercados, plazas) → upsert en `places` con `retrievedAt` y atribución ODbL; `GET /api/cities/:cityId/pois?category=`.
- **Aceptación:** ≥20 POI `REAL` con fuente OSM y fecha; test del endpoint y del filtro; atribución en `sources.md`.
- **Evidencia (2026-11-21, PostgreSQL 16):** importación con filtro de nombres, 118 `REAL` (playas 18, museos 3, parques 83, mercados 4, deportes 10). Reimportar: 0 insertados, 118 actualizados, DEMO 10 → 10. Descartados en esa consulta: 3 nombres genéricos y 8 que no son un lugar (se retiraron de `places`). `name:en`: 0. Plazas con nombre: 0. `npm run check`, `npm run build` y la suite de la API (dos veces, con la importación y sobre una base solo con seed) en verde. La ficha y los marcadores siguen en KH-005.

### KH-005 · Explorar + capa POI + ficha
- **Hecho (REVIEW):** pantalla Explorar con buscador de eventos de la API (texto sin acentos, categoría, hoy / esta semana, filtros en la URL, resaltado, recuento anunciado, estados completos, detalle expandido). Evidencia: `npm run check` y `npm run build` en verde, `search.test.js`, capturas a 390×844, 375×667 y 1440×900 en Cancún y CDMX, con movimiento reducido. Lugares OSM integrados en búsqueda y ficha con fuente/fecha; los marcadores se entregan en KH-006. `searchPois.test.js` cubre filtros, acentos y traducciones.
- **Zona:** `apps/web/src/features/discovery/` (`discovery.api.js`, `usePois.js`, `PoiLayer.jsx`, `PlaceSheet.jsx`, `index.js`), `apps/web/src/app/App.jsx`.
- **Aceptación:** marcadores por categoría; tocar uno abre una ficha (bottom sheet en móvil) con nombre, categoría, `DataStatusBadge`, fuente y fecha; filtros por categoría accesibles con teclado; vacío honesto en ciudad sin datos.

### KH-006 · Capa de transporte en el mapa
- **Zona:** `apps/web/src/features/transit/`, prop/capa en `features/map`.
- **Aceptación:** líneas y paradas dibujadas como capas GeoJSON de MapLibre; activar/desactivar capa; leyenda con fuente; error de fuente visible sin romper el mapa.
- **Evidencia (2026-11-20):** mapa oscuro con rutas reales Cancún y fuente/fecha; la fuente publica `stops: []`, así que no se inventan paradas. Capas POI OSM y zonas CDMX reutilizadas; eventos con coordenadas enlazadas de BD (DEMO identificada), sin coordenadas solo en lista. Selección, lista alternativa, filtro de día, zoom y ubicación opcional en memoria. `DATABASE_URL=…:55432/kindhop npm run check`: API 87, web 9, importador 6; cero fallos. `npm run build` pasa. Chromium 390/375/1440, ES/EN, Cancún/CDMX, reducido, foco, pin/Escape, filtro por teclado, toggle, geolocalización concedida/denegada y sin overflow/pageerror. Capturas `/tmp/map-cancun-390.png`, `/tmp/map-cancun-375-reduced.png`, `/tmp/map-cdmx-1440.png`, `/tmp/map-cdmx-final.png`, `/tmp/map-filters-390.png`. **No verificado:** reproducción de movimiento al 10 %, geolocalización física, integración humana/CI. Aviso de bundle: 1.53 MB minificado (MapLibre/motion).

- **Corrección de composición solicitada:** mapa como fondo completo, sin tarjeta ni título visible; fechas, capas y controles superpuestos. Hoja inferior con asa, primer evento de API (DEMO identificada), selección y lista plegable. QA390/1440 abierto/cerrado en ambas ciudades y canvas de ancho completo, sin scroll del documento.
- **Compatibilidad GTFS tras integrar KH-007:** API89/web10/scripts13 pasan con PostgreSQL; build pasa. Se usa una sola `DataLayers` para Cancún y CDMX, con las 46 paradas publicadas y crédito oficial; sin capa duplicada dentro de `CityMap`.

### KH-007 · CDMX con fuente oficial — REVIEW (transporte; POI de CDMX no)
- **Zona:** `scripts/import-cdmx-gtfs.mjs`, `apps/api/src/modules/transit/`, `apps/web/src/features/transit/`, capa en `DataLayers`.
- **Tarea:** subconjunto del GTFS oficial de SEMOVI (Metrobús línea 1) **sin** horarios en tiempo real ni tarifa inventada.
- **Aceptación:** al cambiar a CDMX el mapa dibuja la línea con fuente y fecha; test con fixture recortado, sin red.
- **Evidencia:** licencia CC BY 4.0 en `docs/06-data/sources.md`. `npm run db:migrate` ×2 y `npm run db:seed` ×2 en PostgreSQL 17. Tests del parser y de `GET /transit` (vacío, import doble, sin `fareCents`). POI de CDMX no se importó.

### KH-008 · E2E del flujo de demo
- **Zona:** `e2e/` en la raíz (Playwright), script `npm run e2e`, job en `.github/workflows/ci.yml`.
- **Aceptación:** un test recorre: abrir app → Cancún → abrir POI → ver transporte → cambiar a CDMX. Mapa base bloqueado no debe romper el test. Corre en CI.

### KH-009 · Zonas
- **Tarea:** polígonos de supermanzanas (Cancún) y alcaldías (CDMX) **solo** desde fuente con licencia verificada; simplificar geometría para que pese < 500 kB.
- **Aceptación:** capa activable con nombre de zona al tocar; fuente/licencia en `sources.md`.

### KH-010 · Presupuesto local-first — REVIEW
- **Zona:** `apps/web/src/features/budget/` (`budget.js` lógica pura, `budget.test.js`, `useBudget.js`, `BudgetPanel.jsx`).
- **Tarea:** presupuesto y gastos en `localStorage` (sin servidor, sin cuenta), categorías fijas, disponible, historial, gráfico por categoría (SVG propio o lib ligera acordada).
- **Aceptación:** todo en centavos enteros (`"12.50"` → `1250`); test con `node --test` del parseo, suma, disponible y monto inválido; nunca pide datos bancarios.

- **Evidencia KH-010:** `npm run check` y `npm run build` en verde; Chromium a 375/390/1440 px, ES/EN, movimiento reducido, teclado, validaciones, persistencia/almacenamiento bloqueado, exceso, edición/borrado/deshacer y CSV. Detalle y límites en [budget](../02-modules/budget.md).

### KH-011 · Incidencias API — REVIEW
- **Zona:** `apps/api/src/modules/reports/`, contrato, `docs/02-modules/reports.md`. Sin migración nueva: el esquema de `urban_reports` ya está en 0001/0002.
- **Tarea:** `GET` (solo no caducadas) y `POST` (zod, límite por IP en memoria, coordenadas redondeadas a 3 decimales); `POST …/:id/confirm`; `PATCH` de moderación detrás de un token de admin en env.
- **Aceptación:** tests: caducada no aparece; entrada inválida → 400; estado inicial `UNVERIFIED`. Los 3 DEMO del seed salen con `dataStatus: DEMO`.
- **Evidencia:** PostgreSQL 16.15; `npm run db:migrate` ×2 y `npm run db:seed` ×2; `DATABASE_URL=… npm test -w @kindhop/api` — 23 tests, 0 fallos (DEMO con etiqueta, 400, `UNVERIFIED`, caducidad, 429, moderación). Sin `DATABASE_URL` el bloque de API se salta y `npm run check` sigue en verde.

### KH-012 · Incidencias UI
- **Aceptación:** marcadores con estado y antigüedad ("hace 20 min"); formulario accesible; los reportes del pitch llevan `DEMO` visible; texto fijo "Reporte comunitario, no oficial".

### KH-013 · Motor de decisiones
- **Zona:** `apps/api/src/modules/decisions/` (función pura `suggest()` + tests) y `GET /api/cities/:cityId/suggestions?placeId=`.
- **Tarea:** reglas deterministas: incidencia activa cerca del destino → proponer POI alternativo de la misma categoría; presupuesto disponible bajo → priorizar gratuitos/transporte público. Cada sugerencia trae `why`, `source`, `asOf`, `confidence` (`HIGH|MEDIUM|LOW` por regla, no inventada).
- **Aceptación:** tests de cada regla; la UI muestra el "por qué" (hecho en KH-020).
- **API (issue #11, en REVIEW):** consultas y endpoint hechos. Evidencia: `npm test -w @kindhop/api` con `DATABASE_URL` (reglas DEMO, exclusión a 300 m, `NULL` no gratis, `EXPLAIN` con `places_city_coords_idx`). **Falta** la pantalla que muestra el «por qué». El transporte público como alternativa no tiene filas (no hay seed de rutas).

### KH-014 · Eventos — REVIEW
- **Hecho:** `GET /api/cities/:cityId/events` lee PostgreSQL (`events.db.ts`); web usa `fetchEvents` vía HTTP; `image` opcional; sin `DATABASE_URL` → `503 DATABASE_UNAVAILABLE` (tras validar ciudad).
- **Zona:** `apps/api/src/modules/events/`, `apps/web/src/features/events/{events.api.js,EventCard.jsx,EventDetail.jsx}`.
- **Evidencia:** `events.test.ts`; `npm run check` sin `DATABASE_URL`; Inicio DEMO en Cancún y CDMX.

### KH-015 · Navegación móvil y rediseño UI — REVIEW
- **Aceptación:** barra inferior de 4 pestañas (Inicio, Explorar, Mapa, Billetera) con indicador activo lima neón; rediseño de interfaz alineado con la maqueta del equipo (tema oscuro, acento lima neón `#ccff00`, buscador de eventos, categorías interactivas y tarjetas de evento horizontales con badges y flechas de acción).
- **Evidencia:** `npm run check` y `npm run build` en verde, claves ES/EN sincronizadas, tests pasando, verificación responsiva a 375, 390 y 1440 px.
- **Reglas:** [ADR-0007](../adr/0007-tema-oscuro-acento-lima.md) y [ux-rules](../03-design/ux-rules.md) describen el tema oscuro con acento lima.

### KH-016 · Despliegue
- **Aceptación:** URL pública de demo con API, variables documentadas en `README.md`, CORS limitado a la URL de la web. Plataforma: ver OPEN-QUESTIONS.

### KH-017 · Demo y pitch
- **Aceptación:** guion de [`demo.md`](demo.md) ensayado 3 veces seguidas sin fallos; video de respaldo grabado; checklist T-60/T-30/T-15 completo.

### KH-017 · Video para el jurado — REVIEW (entrega de video)
- Composición HyperFrames de Claude rehecha como apoyo de una exposición de 5:00: 16 capturas, 300 s, 1920×1080 a 30 fps; MP4 H.264 sin audio para acompañar el pitch.
- Evidencia: check/build del repo correctos; validación de composición, láminas por escenas/cortes, contraste y decodificación completa del MP4. Fuentes y estados DEMO explícitos; Stripe/AdMob siguen pendientes.
- Fuente y revisión: `video/demo-jurado/`; archivo `docs/05-delivery/kinhop-demo-jurado.mp4`. `judge-sim` aplicado como orientación, sin servicios externos.
- Siguen pendientes de la tarjeta completa: ensayo del equipo y validación contra la rúbrica oficial cuando esté disponible. Esta entrega añade el video; no cambia la implementación de KH-020/KH-021.

- Ajuste solicitado: discurso de 635 palabras, presentador único, diez capítulos sincronizados; objeciones comerciales, tecnologías, arquitectura, expansión por adaptadores y Kanban en `PITCH.md` y `storyboard.json`. Ensayo humano pendiente.

### KH-019 · Login Google y protección de sesión — REVIEW
- **Zona:** auth API/web, configuración del proxy Vite, documentación de autenticación.
- **Hecho:** sesión obligatoria, OAuth con PKCE/state/nonce, 20 solicitudes de autenticación por IP cada 10 min antes de asignar sesiones; logout conserva el estado si falla la revocación.
- **Evidencia (21/11/2026):** Google real por Cloudflare: acceso, cuenta correcta en Ajustes, recarga autenticada, logout y recarga sin sesión; redirección de localhost al origen canónico y acceso demo por HTTPS; revisión móvil a 390px y escritorio. `npm run check` y `npm run build` en verde; límites, caducidad, IP falsificada y fallo de revocación cubiertos por pruebas.
- **Entrega:** PR #33 hacia developers, integrado tras #32. Credenciales únicamente en `.env` local. Contadores en memoria: una instancia.

### KH-022 · Responsive sin scroll horizontal — REVIEW
- **Id:** KH-021 es Monetización (PR #35). Las ramas `fix/KH-021-responsive-…` y `fix/KH-022-responsive-…` entregan esta tarjeta; las de rendimiento son KH-023 (carga) y KH-024 (fluidez).
- **Parte 1 (PR #37):** Explorar (`features/events`, `features/discovery`), Mapa (`features/map`, crédito en `index.css`, `features/transit`), Login (`features/auth`) y fichas (`Sheet`, `EventDetail`, `PlaceDetailSheet`, `LocalAlternative`). El membrete solo lo justo para que el `<select>` de ciudad no ensanche el documento.
- **Aceptación:** en 320, 360, 375, 390, 412 y 430 px, ES y EN, con texto al 130 %, no hay scroll horizontal ni piezas fuera del ancho. Las hojas usan `dvh`/`svh` y `safe-area-inset`.
- **Evidencia:** un solo test, `e2e/overflow.spec.js` (`npm run test:overflow`, Playwright): Login, Explorar, Mapa, fichas, shell, Inicio, Billetera, hoja de gasto y Ajustes. `npm run check` y `npm run build`. Capturas antes/después a 360 px en los PR.
- **Cabecera:** marca a la izquierda (`shrink-0`) y un único grupo derecho (`min-w-0 flex-1 justify-end`) con el selector de ciudad (trunca, máx. 12.5rem) y el avatar (`shrink-0`). Cualquier pieza nueva (p. ej. la píldora PRO del avatar de KH-021) va **dentro de ese grupo derecho** y no puede tener ancho mínimo fijo.
- **Parte 2 (PR #39):** shell (`App`, `AppHeader`, `BottomNav`, `Sheet`, `SettingsSheet`), Billetera (`features/budget`) e Inicio (bento, categorías, accesos). Causa extra: un `max-width` en `ch` actuaba como ancho mínimo con texto al 130 %. El selector de ciudad y la cabecera quedan con la solución de la parte 1.

### KH-023 · Carga inicial en móvil — REVIEW
- **Por qué:** en un Android de gama media el primer uso se iba en un único JS de ~1.6 MB (MapLibre incluido) antes de poder tocar Inicio.
- **Zona:** `apps/web` (Vite, pantallas, HTTP, fotos DEMO, fuentes). Sin cambio visual ni de animaciones. La API no sirve la web: la caché de un año aplica a `/assets/` en `vite preview`.
- **Aceptación:** Inicio, Explorar y Billetera no descargan MapLibre; fotos DEMO en AVIF/WebP con tamaño acorde al hueco; Archivo precargada; ciudades, eventos y lugares de la pestaña activa salen en paralelo; `npm run check`, `npm run build` y tests en verde; tabla Lighthouse antes/después en el PR.
- **Evidencia (21/11/2026):** Lighthouse móvil, CPU 4×, 4G lenta simulada. Inicio: LCP 4.8 s → 3.2 s, FCP 3.8 s → 1.8 s, CLS 0.243 → 0.006, transferencia 940 KB → 327 KB. Explorar LCP 6.8 s → 2.8 s. Billetera LCP 4.4 s → 2.6 s. Mapa sigue cargando MapLibre (JS ~468 KB, TBT ~1.5 s). Capturas a 390 px: Inicio y Billetera idénticas; Explorar difiere solo en el grano de las miniaturas. `npm run check` y `npm run build` en verde.

### KH-024 · Fluidez en uso — REVIEW
- **Zona:** web (`app/App.jsx`, `features/map`, `features/events`, `features/discovery/PlaceResults.jsx`, `features/budget/useBudget.js`, `shared/motion/useRevealScroll.js`). Sin cambios de API.
- **Aceptación:** mismos movimientos y el mismo aspecto a 390 px; menos long tasks y frames lentos al desplazarse, escribir, abrir fichas, cambiar de pestaña, mover el mapa y anotar un gasto. `prefers-reduced-motion` se respeta.
- **Hecho:** el mapa no se recrea al cambiar de pestaña; `pixelRatio` ≤ 2 en pantallas estrechas; la búsqueda difiere el filtrado; los lugares de Explorar se muestran de 24 en 24 con el mismo «Ver más...» que Inicio y el Mapa; `localStorage` de la Billetera sale del fotograma del toque.
- **Evidencia (21/11/2026, Chrome, 390×844, CPU 6×, build de producción, 774 lugares OSM):** scroll de Explorar 20 fps y 16 long tasks (895 ms) → 60 fps y 0; tras escribir, 43 fps y una long task de 129 ms → 59 fps y 0. La primera apertura del mapa sigue en ~8 fps (carga del estilo). Inicio, ficha y Billetera ya iban a 60 fps y siguen igual.

### KH-020 · Gasto local (ángulo del pitch) — REVIEW
- **Por qué:** une turismo y economía en una sola acción: dónde gasta el turista ([HACKATHON.md](../../HACKATHON.md)).
- **Zona:** `db/migrations/0008_places_local_business.sql`, `scripts/fetch-osm-pois.mjs` (comercios + `chainOf`), `apps/api/src/modules/{discovery,decisions}/`, web `features/discovery/LocalAlternative.jsx`, `features/budget/{budget.js,ExpenseSheet.jsx,LocalSpendMeter.jsx}`.
- **Aceptación (visible):** en Explorar, abrir «Starbucks» muestra «Cadena según OpenStreetMap» y negocios locales cercanos con «por qué», fuente y confianza; en la Billetera, marcar un gasto como local sube el medidor.
- **Evidencia (21/11/2026):** importación OSM real (774 lugares; 656 comercios, 207 cadenas); `npm test` API 99/99 y web; capturas a 390 px; Starbucks → Tokio Sushi & Bol a 186 m, confianza `MEDIUM`.
- **Límite honesto:** «sin marca en OSM» no prueba que el negocio sea local; por eso la confianza nunca es `HIGH`. El medidor depende de lo que marca el usuario.

### KH-021 · Monetización (5 fuentes de ingresos) — REVIEW
- **Zona:** `apps/web/src/features/monetization/`, `apps/api/src/modules/coupons/`, plan en `modules/auth/users.db.ts`, `db/migrations/0009_monetizacion.sql`, `db/seeds/0003_patrocinios_demo.sql`. Detalle: [monetization](../02-modules/monetization.md).
- **Aceptación (visible):** los 3 primeros mosaicos de «Eventos recomendados por nosotros» son los puestos pagados con «Patrocinado · #n»; el avatar abre plan Pro, cupones (QR + locales) y «Negocios y organizadores» (publicar evento con puesto 1–3, destacar negocio, anuncio personalizado); con «Ver la app como usuario gratis» aparecen los anuncios.
- **Evidencia (21/11/2026):** `npm run check` en verde (API 105, web 34, scripts 18, 381 claves); capturas a 390 px de las 7 vistas.
- **Pendiente:** Stripe Checkout + webhook; pintar negocios destacados en búsqueda y mapa; AdMob en la app móvil; convenios reales.

