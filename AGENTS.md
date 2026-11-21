# AGENTS.md — reglas para cualquier agente (Claude, Codex, Cursor, Gemini…) y personas

**Entrada:** `README.md` (tabla de rutas) → [`docs/agent/ROUTER.md`](docs/agent/ROUTER.md) (2–4 docs por tipo de tarea). No escanees el árbol completo ni cargues todos los documentos para un cambio pequeño.

## Git: solo PRs (obligatorio)
- **Nunca hagas push a `developers` ni a `main`.** Trabaja en una rama `<tipo>/KH-0xx-descripcion` creada desde `developers` y abre un **PR hacia `developers`**.
- **Un agente de IA nunca integra (merge) PRs** ni hace push a ramas compartidas, salvo instrucción explícita del dueño del repo en esa sesión.
- `developers` → `main` solo con un PR de liberación revisado. Detalle completo: [`docs/agent/FLUJO_GIT.md`](docs/agent/FLUJO_GIT.md).

## Prioridades
1. Demo funcional y honesta > calidad de producto > modularidad > extras visuales.
2. Un vertical slice terminado y verificado por entrega. WIP máximo **1 tarjeta** por agente.
3. KISS / YAGNI: la solución más simple que cumple la aceptación. Sin abstracciones "para escalar luego".

## Stack fijo (cambiarlo exige ADR aceptado por el equipo)
- Web: React + HTML + **JavaScript/JSX** (no TS) + Tailwind 4 + Vite + **`motion`** (motion design, [ADR-0005](docs/adr/0005-tarjeta-de-visita-y-motion.md)). Iconos solo `lucide-react` con trazo 1.5, nunca emojis en la UI.
- API: Node + Express 5 + **TypeScript** + zod para validar entradas.
- Datos: PostgreSQL, SQL versionado en `db/migrations/` (nunca editar una migración ya aplicada en `main`: crear la siguiente). PostGIS solo con caso real.
- Mapa: MapLibre GL; estilo y atribución según [`docs/06-data/sources.md`](docs/06-data/sources.md).
- Prohibido para el MVP: microservicios, Turborepo/Nx, colas, CQRS, Kafka, repositorios/factories genéricos, Redux/TanStack Query, librerías de UI sin acuerdo.

## Arquitectura (resumen; detalle en [overview](docs/01-architecture/overview.md))
- **Web por features:** `apps/web/src/features/<dominio>/` con `index.js` público. Se importa **solo** `@/features/<dominio>`; `shared/` nunca importa de `features/` ni `app/`. ESLint lo hace cumplir.
- Componente muestra → hook decide (`{status, data, error, reload}`) → `<dominio>.api.js` habla con la API vía `shared/lib/http.js`. Ningún componente llama a `fetch`.
- **API por módulos:** `apps/api/src/modules/<dominio>/` con `index.ts` público, `routes.ts` (HTTP + validación), lógica y `adapters/<cityId>.ts` por fuente. `requireCity()` valida la ciudad y `pickAdapter()` elige la fuente. Se monta con una línea en `src/app.ts`. Recetas en [overview](docs/01-architecture/overview.md#recetas).
- **Carga de datos web:** hooks de feature con `useResource` (`shared/hooks/`); estados con `LoadingState` / `ErrorState`.
- Errores API: `throw new AppError(status, CODE, mensaje)`; formato `{ error: { code, message } }`.

## Restricciones no negociables
- **Sesión obligatoria:** toda ruta nueva de `/api` queda detrás de `requireSession` (ya montado en `app.ts`); nunca la saques de ahí ni guardes tokens en `localStorage`. Secretos solo en `apps/api/.env`. Detalle: [`docs/02-modules/auth.md`](docs/02-modules/auth.md).
- **Idiomas:** todo texto visible de la web vive en `apps/web/src/shared/i18n/locales/{es,en}.json` y se usa con `useI18n().t('clave')`. Nunca texto fijo en componentes (ESLint lo bloquea); toda clave nueva va en **ambos** JSON (`npm run check` lo verifica). Errores: se traduce `error.code`. Guía: [`docs/03-design/i18n.md`](docs/03-design/i18n.md).
- Dinero en **centavos enteros**; fechas **ISO 8601 UTC**; ciudad como `cityId`; geometrías **GeoJSON** válido (lon, lat).
- SQL siempre parametrizado; validar en servidor aunque la web ya valide; sin secretos en el repo ni en variables `VITE_`.
- No inventar rutas, horarios, tiempo real, costos, métricas ni resultados de herramientas. Si falta un dato: estado vacío honesto + entrada en [`docs/OPEN-QUESTIONS.md`](docs/OPEN-QUESTIONS.md).
- Incidencias: comunitarias, con caducidad, estado y moderación; **nunca** afirmar que una ruta es segura.
- No scraping de Google Maps. Respetar licencias (OSM = ODbL + atribución).
- **Estilo:** tema oscuro con un único acento lima `#ccff00` solo para la acción principal, lo activo y el foco ([ADR-0007](docs/adr/0007-tema-oscuro-acento-lima.md)); solo tokens de `@theme`, nunca hex ni colores de la paleta de Tailwind en componentes; texto ≥ 4.5:1 ([ux-rules](docs/03-design/ux-rules.md)).
- **Movimiento:** todo componente nuevo se mueve con el vocabulario de `shared/motion/motion.js` y cumple [motion.md](docs/03-design/motion.md): un momento focal por pantalla, expansiones que se pliegan en reversa, solo `transform`/`opacity`, sin rebote y con alternativa de movimiento reducido.
- Accesibilidad mínima: teclado, foco visible, labels, contraste 4.5:1, objetivos táctiles 44px, `prefers-reduced-motion`.

## Flujo por tarjeta
1. Toma una tarjeta `TODO` de [`backlog`](docs/05-delivery/backlog.md) que cumpla Definition of Ready; márcala `DOING` con tu rol.
2. Rama `feat/KH-0xx-slug` (o `fix/`, `docs/`, `refactor/`, `test/`, `chore/`) **creada desde `developers`**. Toca solo la zona de archivos de la tarjeta.
3. Si cambias o creas un endpoint: actualiza primero [`docs/04-api/contract.md`](docs/04-api/contract.md).
4. Implementa el mínimo que cumple la aceptación, con estados carga/error/vacío.
5. `npm run check` y `npm run build` en verde + prueba manual del flujo en navegador (390px y escritorio). No digas "funciona" sin haberlo visto.
6. Actualiza README/FILEMAP si cambian rutas, el doc del módulo (IMPLEMENTADO/PLANIFICADO/POR VALIDAR) y la tarjeta (`REVIEW` con evidencia).
7. Commit convencional en español: `feat(transit): ruta R-1 de Cancún en el mapa`. Push de **tu** rama y PR pequeño **hacia `developers`** con la plantilla. No lo integres tú: lo integra una persona tras revisión y CI en verde.

Detalle de metodología, roles y zonas de archivos: [`docs/agent/WORKFLOW.md`](docs/agent/WORKFLOW.md). Skills disponibles y cuándo usarlas: [`docs/agent/SKILLS.md`](docs/agent/SKILLS.md).
