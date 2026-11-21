# Backlog KindHop — Kanban `TODO → DOING → REVIEW → DONE`

Reglas: WIP 1 por agente · una tarjeta = un resultado observable · nada pasa a `DONE` sin evidencia (comando, captura o test) · las asignaciones son **por rol** hasta que el equipo ponga nombres. Roles y zonas de archivos: [`../agent/WORKFLOW.md`](../agent/WORKFLOW.md).

**Contrato primero:** si una tarjeta frontend depende de un endpoint aún no hecho, se trabaja contra el contrato de [`../04-api/contract.md`](../04-api/contract.md) con un fixture marcado `DEMO`, y se conecta al real al cerrar la tarjeta backend.

## Tablero

| ID | Prio | Estado | Rol | Depende de | Título |
|---|---|---|---|---|---|
| KH-001 | P0 | DONE | integrador | — | Bootstrap monorepo, API base, mapa, CI |
| KH-002 | P0 | TODO | integración | — | Validar reglas del evento + acceso a API Rutas Cancún |
| KH-003 | P0 | TODO | backend | KH-002 | Adaptador transporte Cancún → `GET /transit` |
| KH-004 | P0 | TODO | datos | — | POI reales de Cancún (OSM snapshot) → `GET /pois` |
| KH-005 | P0 | TODO | frontend | contrato `/pois` | Capa POI + ficha inferior con fuente |
| KH-006 | P0 | TODO | frontend | contrato `/transit` | Capa de transporte en el mapa |
| KH-007 | P0 | TODO | datos | — | CDMX: POI + 1 línea de transporte con fuente oficial |
| KH-008 | P0 | TODO | QA | KH-005 | E2E Playwright del flujo de demo en CI |
| KH-009 | P1 | TODO | datos | — | Zonas: supermanzanas Cancún / alcaldías CDMX |
| KH-010 | P1 | TODO | frontend | — | Presupuesto local-first con gráfico por categoría |
| KH-011 | P1 | REVIEW | backend | KH-018 | Incidencias: API con caducidad y estados |
| KH-012 | P1 | TODO | frontend | KH-011 | Incidencias: capa + formulario + etiqueta DEMO |
| KH-013 | P1 | REVIEW | backend | KH-004, KH-011 | Motor de decisiones: consultas y GET /suggestions (falta la UI) |
| KH-014 | P1 | REVIEW | backend + frontend | KH-018 | Tablón de eventos futuros con fuente |
| KH-015 | P1 | REVIEW | frontend | KH-005 | Navegación móvil y rediseño UI tema oscuro y lima según maqueta |
| KH-016 | P1 | TODO | integrador | KH-008 | Despliegue de demo (web + API) |
| KH-017 | P0 | TODO | QA / pitch | KH-008 | Guion de demo, video de respaldo, judge-sim |
| KH-018 | P0 | REVIEW | datos | — | Esquema completo del MVP, seeds DEMO y diccionario de datos (issues #2–#11) |

**Bloqueado (P2, no tomar hasta que P0+P1 estén en `DONE`):** más ciudades, IA/LLM, open finance, recomendaciones predictivas, estadísticas institucionales, autenticación completa, modo offline real.

## Tarjetas

### KH-018 · Base de datos del MVP — REVIEW
- **Zona:** `db/migrations/0002_mvp_schema.sql`, `db/migrations/0003_source_id_not_null.sql`, `db/seeds/`, `apps/api/src/shared/{seed.ts,db.schema.test.ts}`, `docs/06-data/database.md`, ADR-0006.
- **Evidencia:** migraciones y seeds aplicados 2 veces en PostgreSQL 17; 5 tests del esquema en verde; CI corre seeds y tests contra PostgreSQL.
- **Pendiente:** issues [#2–#11](https://github.com/MoggerSir/KindHop/issues?q=label%3Abase-de-datos) (etiqueta `base-de-datos`).

### KH-001 · Bootstrap — DONE
Evidencia: `npm ci`, `npm run check` (6 tests API), `npm run build`, `npm run db:migrate` ×2 en PostgreSQL 16, Playwright: selector Cancún↔CDMX y estado de error con reintento. Commit del 20/11/2026.

### KH-002 · Validar reglas del evento + API Rutas Cancún
- **Valor:** desbloquea legalmente la pieza central de la demo.
- **Tarea:** leer reglas oficiales (¿se permite trabajo/servicios previos declarados?); obtener del autor de la API: URL base, endpoints, formato, licencia/términos, límites, disponibilidad el día de la demo. Escribir el contrato externo en `docs/02-modules/cities-and-transit.md` y la fila en `docs/06-data/sources.md`.
- **Aceptación:** OPEN-QUESTIONS #1 y #2 cerradas con evidencia (enlace/cita); `curl` real a un endpoint documentado.
- **Fallback:** si no se permite, KH-003 usa un dataset abierto de rutas o se muestra "transporte no disponible" (nunca rutas inventadas).

### KH-003 · Adaptador transporte Cancún
- **Valor:** el turista ve cómo llegar en transporte público real.
- **Zona:** `apps/api/src/modules/transit/` (`routes.ts`, `cancun.adapter.ts`, `transit.test.ts`), una línea en `apps/api/src/app.ts`.
- **Tarea:** `GET /api/cities/:cityId/transit` → `{ routes: TransitRoute[], source }` según contrato; timeout y caché en memoria (TTL corto); error `TRANSIT_UNAVAILABLE` (502) si la fuente falla.
- **Aceptación:** test con respuesta simulada de la fuente (normalización) + test de fallo; `curl` real devuelve ≥1 ruta con `geometry` GeoJSON y `source`.

### KH-004 · POI reales de Cancún
- **Zona:** `scripts/fetch-osm-pois.mjs` (one-off, documentado), `db/seeds/` o `apps/api/src/modules/discovery/data/cancun.pois.json`, `apps/api/src/modules/discovery/`.
- **Tarea:** consulta Overpass acotada (playas, museos, parques, plazas) → snapshot versionado con `retrievedAt` y atribución ODbL; `GET /api/cities/:cityId/pois?category=`.
- **Aceptación:** ≥20 POI `REAL` con fuente OSM y fecha; test del endpoint y del filtro; atribución en `sources.md`.

### KH-005 · Capa POI + ficha
- **Zona:** `apps/web/src/features/discovery/` (`discovery.api.js`, `usePois.js`, `PoiLayer.jsx`, `PlaceSheet.jsx`, `index.js`), `apps/web/src/app/App.jsx`.
- **Aceptación:** marcadores por categoría; tocar uno abre una ficha (bottom sheet en móvil) con nombre, categoría, `DataStatusBadge`, fuente y fecha; filtros por categoría accesibles con teclado; vacío honesto en ciudad sin datos.

### KH-006 · Capa de transporte en el mapa
- **Zona:** `apps/web/src/features/transit/`, prop/capa en `features/map`.
- **Aceptación:** líneas y paradas dibujadas como capas GeoJSON de MapLibre; activar/desactivar capa; leyenda con fuente; error de fuente visible sin romper el mapa.

### KH-007 · CDMX con fuente oficial
- **Zona:** `apps/api/src/modules/transit/cdmx.adapter.ts`, datos POI CDMX.
- **Tarea:** elegir un subconjunto pequeño (p. ej. una línea de Metrobús desde GTFS oficial de datos.cdmx.gob.mx) **sin** horarios en tiempo real; misma forma de contrato que Cancún.
- **Aceptación:** al cambiar a CDMX el mapa muestra otra fuente con su atribución y fecha; test del adaptador con fixture recortado del GTFS real.

### KH-008 · E2E del flujo de demo
- **Zona:** `e2e/` en la raíz (Playwright), script `npm run e2e`, job en `.github/workflows/ci.yml`.
- **Aceptación:** un test recorre: abrir app → Cancún → abrir POI → ver transporte → cambiar a CDMX. Mapa base bloqueado no debe romper el test. Corre en CI.

### KH-009 · Zonas
- **Tarea:** polígonos de supermanzanas (Cancún) y alcaldías (CDMX) **solo** desde fuente con licencia verificada; simplificar geometría para que pese < 500 kB.
- **Aceptación:** capa activable con nombre de zona al tocar; fuente/licencia en `sources.md`.

### KH-010 · Presupuesto local-first
- **Zona:** `apps/web/src/features/budget/` (`budget.js` lógica pura, `budget.test.js`, `useBudget.js`, `BudgetPanel.jsx`).
- **Tarea:** presupuesto y gastos en `localStorage` (sin servidor, sin cuenta), categorías fijas, disponible, historial, gráfico por categoría (SVG propio o lib ligera acordada).
- **Aceptación:** todo en centavos enteros (`"12.50"` → `1250`); test con `node --test` del parseo, suma, disponible y monto inválido; nunca pide datos bancarios.

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
- **Aceptación:** tests de cada regla; la UI muestra el "por qué".
- **API (issue #11, en REVIEW):** consultas y endpoint hechos. Evidencia: `npm test -w @kindhop/api` con `DATABASE_URL` (reglas DEMO, exclusión a 300 m, `NULL` no gratis, `EXPLAIN` con `places_city_coords_idx`). **Falta** la pantalla que muestra el «por qué». El transporte público como alternativa no tiene filas (no hay seed de rutas).

### KH-014 · Eventos — REVIEW
- **Hecho:** `GET /api/cities/:cityId/events` lee PostgreSQL (`events.db.ts`); web usa `fetchEvents` vía HTTP; `image` opcional; sin `DATABASE_URL` → `503 DATABASE_UNAVAILABLE` (tras validar ciudad).
- **Zona:** `apps/api/src/modules/events/`, `apps/web/src/features/events/{events.api.js,EventCard.jsx,EventDetailSheet.jsx}`.
- **Evidencia:** `events.test.ts`; `npm run check` sin `DATABASE_URL`; Inicio DEMO en Cancún y CDMX.

### KH-015 · Navegación móvil y rediseño UI — REVIEW
- **Aceptación:** barra inferior de 4 pestañas (Inicio, Explorar, Mapa, Perfil) con indicador activo lima neón; rediseño de interfaz alineado con la maqueta del equipo (tema oscuro, acento lima neón `#ccff00`, buscador de eventos, categorías interactivas y tarjetas de evento horizontales con badges y flechas de acción).
- **Evidencia:** `npm run check` y `npm run build` en verde, 122 claves de idiomas bilingües sincronizadas, tests pasando, verificación responsiva a 390 px.

### KH-016 · Despliegue
- **Aceptación:** URL pública de demo con API, variables documentadas en `README.md`, CORS limitado a la URL de la web. Plataforma: ver OPEN-QUESTIONS.

### KH-017 · Demo y pitch
- **Aceptación:** guion de [`demo.md`](demo.md) ensayado 3 veces seguidas sin fallos; video de respaldo grabado; checklist T-60/T-30/T-15 completo.
