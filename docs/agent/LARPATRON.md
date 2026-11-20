# Reglas recuperadas de Larpatron

**Fuente:** `github.com/MoggerSir/larpatron`, commit `fcff368` (19/11/2026, "Base del equipo para Hack Maya 2026"), leído el 20/11/2026: `README.md`, `AGENTS.md`, `CLAUDE.md`, `agents/{frontend,backend,reviewer}.md`, `docs/*.md`, `references/skills.md`, `eslint.config.js`, `package.json`. **VERIFICADO.**

**No se copió código ni historial.** KindHop tiene su propio historial desde el 20/11/2026; la configuración de ESLint se reescribió con la misma intención.

## Adoptado
| Regla de Larpatron | Dónde vive en KindHop |
|---|---|
| Features independientes, consumidas solo por `index.js`; `shared` no depende de nada de arriba (ESLint) | `apps/web/eslint.config.js`, AGENTS.md |
| Componente → hook `{status, data, error, reload}` → `*.api.js` → `shared/lib/http.js` (timeout, errores legibles, AbortSignal) | `apps/web/src/shared/lib/http.js`, `features/cities/` |
| Contrato del endpoint acordado antes de implementar | `docs/04-api/contract.md`, backlog "contrato primero" |
| Estados carga / error con reintento / vacío en toda pantalla | `apps/web/src/app/App.jsx` |
| `npm run check` antes de cada commit + verlo en el navegador | AGENTS.md, DoD |
| Iconos solo `lucide-react`, nunca emojis | AGENTS.md, ux-rules |
| Accesibilidad: teclado, foco visible, 44px, `aria-busy`, `role="alert"`, `lang="es"`, reduced-motion | ux-rules |
| Rendimiento: constantes fuera del componente, `Map` para búsquedas, limpiar efectos y peticiones | ux-rules, `features/cities/useCities.js` |
| Rol revisor con informe por severidad y Bloquear/Aprobar | `docs/agent/WORKFLOW.md` |
| Código en inglés, UI y commits en español | AGENTS.md |
| Checklist de demo T-60 / T-30 / T-15 | `docs/05-delivery/checklist.md` |
| Inventario de skills por momento del hackatón; `.hackathon/` fuera de git | `docs/agent/SKILLS.md`, `.gitignore` |

## Adaptado o descartado (con motivo)
| Larpatron | KindHop | Motivo |
|---|---|---|
| Sin Tailwind, CSS Modules | **Tailwind 4** con tokens en `@theme` | Stack fijado por el prompt maestro de KindHop |
| Diseño monocromo "papel" sin color de acento | Neutros sobrios + 1 acento + colores semánticos de estado | Un mapa necesita distinguir capas y estados `REAL/DEMO` |
| Sin backend propio | API Express + TS + PostgreSQL | Stack fijado; KindHop tiene adaptadores multicidad |
| react-router, motion, fuentes locales | No incluidos aún | YAGNI: una pantalla; se añaden por tarjeta si hacen falta |
| Datos simulados con `delay()` si no hay `VITE_API_URL` | Fixture solo con etiqueta `DEMO` visible; si no, error honesto | Política de datos de KindHop |
