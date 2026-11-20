# AGENTS.md — reglas para cualquier agente (Claude, Codex, Cursor, Gemini…) y personas

**Entrada:** `README.md` (tabla de rutas) → [`docs/agent/ROUTER.md`](docs/agent/ROUTER.md) (2–4 docs por tipo de tarea). No escanees el árbol completo ni cargues todos los documentos para un cambio pequeño.

## Prioridades
1. Demo funcional y honesta > calidad de producto > modularidad > extras visuales.
2. Un vertical slice terminado y verificado por entrega. WIP máximo **1 tarjeta** por agente.
3. KISS / YAGNI: la solución más simple que cumple la aceptación. Sin abstracciones "para escalar luego".

## Stack fijo (cambiarlo exige ADR aceptado por el equipo)
- Web: React + HTML + **JavaScript/JSX** (no TS) + Tailwind 4 + Vite. Iconos solo `lucide-react`, nunca emojis en la UI.
- API: Node + Express 5 + **TypeScript** + zod para validar entradas.
- Datos: PostgreSQL, SQL versionado en `db/migrations/` (nunca editar una migración ya aplicada en `main`: crear la siguiente). PostGIS solo con caso real.
- Mapa: MapLibre GL; estilo y atribución según [`docs/06-data/sources.md`](docs/06-data/sources.md).
- Prohibido para el MVP: microservicios, Turborepo/Nx, colas, CQRS, Kafka, repositorios/factories genéricos, Redux/TanStack Query, librerías de UI sin acuerdo.

## Arquitectura (resumen; detalle en [overview](docs/01-architecture/overview.md))
- **Web por features:** `apps/web/src/features/<dominio>/` con `index.js` público. Se importa **solo** `@/features/<dominio>`; `shared/` nunca importa de `features/` ni `app/`. ESLint lo hace cumplir.
- Componente muestra → hook decide (`{status, data, error, reload}`) → `<dominio>.api.js` habla con la API vía `shared/lib/http.js`. Ningún componente llama a `fetch`.
- **API por módulos:** `apps/api/src/modules/<dominio>/` con `routes.ts` (HTTP + validación), lógica y adaptadores de fuente separados en archivos simples. Se monta con una línea en `src/app.ts`.
- Errores API: `throw new AppError(status, CODE, mensaje)`; formato `{ error: { code, message } }`.

## Restricciones no negociables
- Dinero en **centavos enteros**; fechas **ISO 8601 UTC**; ciudad como `cityId`; geometrías **GeoJSON** válido (lon, lat).
- SQL siempre parametrizado; validar en servidor aunque la web ya valide; sin secretos en el repo ni en variables `VITE_`.
- No inventar rutas, horarios, tiempo real, costos, métricas ni resultados de herramientas. Si falta un dato: estado vacío honesto + entrada en [`docs/OPEN-QUESTIONS.md`](docs/OPEN-QUESTIONS.md).
- Incidencias: comunitarias, con caducidad, estado y moderación; **nunca** afirmar que una ruta es segura.
- No scraping de Google Maps. Respetar licencias (OSM = ODbL + atribución).
- Accesibilidad mínima: teclado, foco visible, labels, contraste 4.5:1, objetivos táctiles 44px, `prefers-reduced-motion`.

## Flujo por tarjeta
1. Toma una tarjeta `TODO` de [`backlog`](docs/05-delivery/backlog.md) que cumpla Definition of Ready; márcala `DOING` con tu rol.
2. Rama `feat/KH-0xx-slug` (o `fix/`, `docs/`). Toca solo la zona de archivos de la tarjeta.
3. Si cambias o creas un endpoint: actualiza primero [`docs/04-api/contract.md`](docs/04-api/contract.md).
4. Implementa el mínimo que cumple la aceptación, con estados carga/error/vacío.
5. `npm run check` y `npm run build` en verde + prueba manual del flujo en navegador (390px y escritorio). No digas "funciona" sin haberlo visto.
6. Actualiza README/FILEMAP si cambian rutas, el doc del módulo (IMPLEMENTADO/PLANIFICADO/POR VALIDAR) y la tarjeta (`REVIEW` con evidencia).
7. Commit convencional en español: `feat(transit): ruta R-1 de Cancún en el mapa`. PR pequeño con la plantilla.

Detalle de metodología, roles y zonas de archivos: [`docs/agent/WORKFLOW.md`](docs/agent/WORKFLOW.md). Skills disponibles y cuándo usarlas: [`docs/agent/SKILLS.md`](docs/agent/SKILLS.md).
