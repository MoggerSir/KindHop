# FILEMAP — rutas estables para agentes

**Si cambias o creas una ruta, actualiza este documento en el mismo commit.** Esta tabla es la primera parada antes de un grep.

| Responsabilidad | Ruta exacta | Estado inicial |
|---|---|---|
| Prompt de continuación/creación agente | `docs/agent/PROMPT_MAESTRO.md` | Existe |
| Instrucciones del repositorio | `AGENTS.md` | Existe |
| Entrada y navegación | `README.md` | Existe |
| Producto y límites | `docs/00-product/` | Existe |
| Contrato y arquitectura | `docs/01-architecture/`, `docs/04-api/` | Existe |
| Mapa y geolocalización | `apps/web/src/features/map/` | Por implementar |
| Navegación de app / páginas | `apps/web/src/app/` | Existe |
| Eventos y POI | `apps/web/src/features/discovery/` | Por implementar |
| Presupuesto | `apps/web/src/features/budget/` | Por implementar |
| Reportes | `apps/web/src/features/reports/` | Por implementar |
| Adaptadores por ciudad (API) | `apps/api/src/modules/cities/` | Existe |
| Rutas transporte (API) | `apps/api/src/modules/transit/` | Por implementar |
| Alertas y reportes (API) | `apps/api/src/modules/reports/` | Por implementar |
| Gastos (API) | `apps/api/src/modules/budget/` | Por implementar |
| API Express inicial | `apps/api/src/server.ts` | Existe |
| SQL y migrations | `db/migrations/` | Existe |
| Tests API | `apps/api/src/**/*.test.ts` | Por implementar |
| Config Vite | `apps/web/vite.config.js` | Existe |
| Config Tailwind | `apps/web/src/index.css` | Existe |
| Variables API | `apps/api/.env.example` | Existe |
| CI | `.github/workflows/ci.yml` | Existe |

**Búsqueda de último recurso:** `git ls-files 'apps/web/src/**'` limitado a módulo; no ejecutar búsquedas globales sin agotar README/FILEMAP.
