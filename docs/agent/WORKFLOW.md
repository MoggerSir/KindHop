# Workflow ágil — KinHop

**Kanban ultraligero** `TODO → DOING → REVIEW → DONE` en [`../05-delivery/backlog.md`](../05-delivery/backlog.md). Mini-sprints de 60–90 min; sincronización corta cada 30–60 min o al cerrar un slice. **`main` siempre demostrable.**

## Definition of Ready
Problema y usuario claros · tarea acotada · rol/owner · ruta exacta · datos disponibles (o fixture `DEMO` acordado) · criterios de aceptación · fallback.

## Definition of Done
UI + API + datos integrados si aplica · estados carga/error/vacío · accesibilidad mínima · `npm run check` y `npm run build` en verde · demo manual en 390px y escritorio · docs del módulo, contrato, README/FILEMAP al día · evidencia en la tarjeta. **Compilar no es DONE.**

## Roles y zonas de archivos (evitan colisiones)

| Rol | Zona propia | Toca con aviso |
|---|---|---|
| **frontend** | `apps/web/src/features/<dominio>/`, `apps/web/src/shared/` | `apps/web/src/app/App.jsx`, `index.css` (tokens) |
| **backend** | `apps/api/src/modules/<dominio>/`, `apps/api/src/shared/` | `apps/api/src/app.ts` (1 línea por módulo), `docs/04-api/contract.md` |
| **datos** | `scripts/`, adaptadores `*.adapter.ts`, snapshots `data/`, `docs/06-data/` | `db/migrations/` (siguiente número libre) |
| **integración** | contrato externo Rutas Cancún, despliegue, `.env.example` | CI |
| **QA** | `e2e/`, `docs/05-delivery/` | cualquier archivo solo para reportar, no reescribir |
| **integrador** (persona) | revisa e integra PRs en `developers`, abre la liberación `developers` → `main`, resuelve conflictos en archivos compartidos | todo |

Archivos compartidos (`App.jsx`, `app.ts`, `contract.md`, `FILEMAP.md`, `README.md`): cambios mínimos y avisar en el canal antes de tocarlos.

## Ramas, commits y PR
Fuente completa y obligatoria: [`FLUJO_GIT.md`](FLUJO_GIT.md).
- Rama desde `developers`: `feat/KH-0xx-slug`, `fix/…`, `docs/…`. PR pequeño (ideal < 300 líneas) **hacia `developers`** con la plantilla de `.github/pull_request_template.md`.
- Commits convencionales en español, presente: `feat(discovery): ficha de lugar con fuente`.
- **Nunca** push directo a `developers` ni a `main`, ni siquiera con prisa. Sin tiempo: PR pequeño y avisar al integrador.
- Los agentes no integran PRs; el rol **integrador** (persona) hace el squash merge a `developers` y el PR de liberación a `main`.

## Revisión (rol revisor, heredado de Larpatron)
1. `npm run check`; si falla, eso va primero. 2. Leer el diff y el código que toca. 3. Abrir la pantalla: móvil, escritorio, teclado.
Informe: tabla severidad (ALTA rompe algo/accesibilidad · MEDIA inconsistencia visible · BAJA pulido), `archivo:línea`, problema, solución. Termina en **Bloquear** (si hay ALTA) o **Aprobar**. No aprobar lo no revisado ni bloquear por gustos.

## Orden de implementación
P0: bootstrap → mapa Cancún → una ruta real → POI (+ zona si hay fuente) → CDMX con fuente real → demo E2E.
P1: eventos · incidencias con caducidad · presupuesto · cambio contextual explicado.
P2: bloqueado (ver backlog).
