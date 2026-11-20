# Desarrollo ágil acelerado — KindHop

**Modalidad:** Kanban con mini-sprints de 60–90 min y sincronización breve cada 30–60 min, ajustados al tiempo real del hackatón. Limitar WIP a 1 por agente. Un integrador aprueba `main` y conserva una versión demo estable.

**Definition of Ready:** tarea pequeña, ruta/owner identificados, criterios de aceptación, datos necesarios y fallback de demo.

**Definition of Done:** el flujo realmente funciona, errores tratados, accesibilidad mínima, tests pertinentes pasados, docs/FILEMAP/contratos actualizados, demo no rota. Nunca declarar completado con datos inventados.

**Ramas:** `feat/map-cancun`, `feat/cdmx`, `fix/flood-validation`, `docs/filemap`; commits convencionales, PR pequeños (ideal <=300 líneas salvo bootstrap). Evitar editar el mismo archivo entre agentes; si ocurre, pactar orden.

**Orden:** 1) bootstrap/web+API, 2) mapa y ciudad Cancún, 3) transporte y POI, 4) switch CDMX, 5) reporte/incidencia simulada claramente etiquetada, 6) presupuesto manual, 7) eventos, 8) recálculo explicable, 9) pitch y QA.

**Vertical slice:** UI → API → datos → mensaje de error → criterio de aceptación → demo. No comenzar cinco servicios sin integrarlos.

**Comandos verificables:** `npm run check`, `npm run build`, `npm run dev`. Para revisión de PR confirmar las condiciones reales de ejecución.
