# CLAUDE.md

Las instrucciones del proyecto están en [`AGENTS.md`](AGENTS.md) (fuente única). Empieza por [`README.md`](README.md).

Solo para Claude Code:
- Elige tu rol y zona de archivos en [`docs/agent/WORKFLOW.md`](docs/agent/WORKFLOW.md).
- Skills: ver [`docs/agent/SKILLS.md`](docs/agent/SKILLS.md). Con `/impeccable` o `/better-ui`, [`docs/03-design/ux-rules.md`](docs/03-design/ux-rules.md) manda sobre los valores por defecto de la skill. No invoques skills para cambios triviales.
- Git: **solo PRs hacia `developers`**; nunca push a `developers`/`main` ni merge de PRs ([`docs/agent/FLUJO_GIT.md`](docs/agent/FLUJO_GIT.md)).
- Antes de decir "listo": `npm run check`, `npm run build` y revisar la pantalla en el navegador.
