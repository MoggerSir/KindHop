# Router de contexto para agentes

Abre **solo** estos documentos (2–4) más los archivos de tu zona. Amplía únicamente si una dependencia real lo exige.

| Tipo de tarea | Leer en este orden | No leer |
|---|---|---|
| Pantallas / navegación | `docs/03-design/screens.md` → `apps/web/src/app/` | API, SQL |
| Textos / idiomas | `docs/03-design/i18n.md` → `apps/web/src/shared/i18n/locales/es.json` | API, SQL |
| UI / layout / estilos | `docs/03-design/ux-rules.md` → `apps/web/src/index.css` → feature afectada | SQL, adaptadores |
| Mapa y capas | `docs/02-modules/map.md` → `docs/06-data/sources.md` → `apps/web/src/features/map/` | presupuesto |
| Transporte / cambio de ciudad | `docs/02-modules/cities-and-transit.md` → `docs/04-api/contract.md` → `apps/api/src/modules/cities/` | componentes UI |
| POI / eventos | `docs/02-modules/discovery.md` → `docs/04-api/contract.md` → `docs/06-data/sources.md` | presupuesto |
| Incidencias | `docs/02-modules/reports.md` → `docs/06-data/data-policy.md` → `docs/04-api/contract.md` | presupuesto |
| Presupuesto | `docs/02-modules/budget.md` → `docs/03-design/ux-rules.md` | mapa, SQL |
| Endpoint nuevo | `docs/04-api/contract.md` → `apps/api/src/app.ts` → `apps/api/src/shared/errors.ts` | UI |
| Base de datos | `db/README.md` → `db/migrations/` → `apps/api/src/shared/db.ts` | UI |
| QA / demo / pitch | `docs/05-delivery/checklist.md` → `docs/05-delivery/demo.md` → `docs/agent/SKILLS.md` | código no relacionado |
| Arquitectura / stack | `docs/01-architecture/overview.md` → `docs/adr/` | — |
