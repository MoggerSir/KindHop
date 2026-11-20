# Skills de agentes — inventario

Comprobado el 20/11/2026 en el entorno de Claude Code donde se hizo el bootstrap, y contrastado con `references/skills.md` de Larpatron. **Ninguna se instaló desde este repo** y no hay scripts de instalación aquí. Lo que diga `docs/` manda sobre los valores por defecto de cualquier skill. Una skill por paso; ninguna para cambios triviales.

| Skill | Estado en el entorno del bootstrap | Origen | Uso en KindHop |
|---|---|---|---|
| `ponytail` (+ `-review`, `-audit`, `-debt`) | DISPONIBLE | instalada en el entorno | Implementación mínima; revisión anti-sobreingeniería |
| `caveman` | DISPONIBLE | instalada en el entorno | Respuestas cortas para ahorrar tokens |
| `impeccable` | DISPONIBLE | instalada en el entorno | Diseño/auditoría UI (`polish`, `audit`, `critique`) siguiendo `03-design/ux-rules.md` |
| `better-ui` | DISPONIBLE | instalada en el entorno | Pulido fino de superficies, iconos y movimiento |
| `grilling` | DISPONIBLE | instalada en el entorno | Estresar un plan antes de construirlo |
| `hackathon-kickoff`, `scope-knife`, `judge-sim`, `pitch-timebox` | NO en este entorno; Larpatron dice que están instaladas en las máquinas del equipo | candidato `zghanw/hackathon-skills` / `maga2010org/hackathon-run` — **NO AUDITADO** | Kickoff, recorte de alcance (KEEP/CUT/DEFER), simulación de jurado, pitch |
| `verification-loop`, `e2e-testing` | NO en este entorno; Larpatron: instaladas en el equipo | candidato `affaan-m/ECC` — **NO AUDITADO** | Tras cada slice; E2E de KH-008 |
| `systematic-debugging` | NO en este entorno; Larpatron: instalada | candidato `obra/superpowers` — **NO AUDITADO** | Buscar causa raíz antes de corregir |
| `vercel-react-best-practices` | NO en este entorno; Larpatron: instalada | candidato `vercel-labs/agent-skills` — **NO AUDITADO** | Solo ante un problema real de rendimiento |
| Cloudflare skills | NO | — | No aplica: el stack no es Cloudflare; no imponer Workers/D1 |

## Por fase
Kickoff/alcance: `hackathon-kickoff`, `scope-knife`, `grilling` · Implementación: `ponytail` · UI: `impeccable`, `better-ui` · QA: `verification-loop`, `e2e-testing`, `systematic-debugging`, `ponytail-review` · Última hora: `judge-sim`, `pitch-timebox`.

## Instalar una skill nueva
Leer su README, `SKILL.md` y scripts; comprobar mantenedor y licencia; nada de `curl | bash` opaco. Registrar aquí origen, versión y riesgo antes de usarla. `scope-knife`/`judge-sim` escriben en `.hackathon/` (ignorado por git).
