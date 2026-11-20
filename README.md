# KindHop — City Decision Engine

> **20 de noviembre de 2026 · Hackatón · Monorepo creado desde cero.**
>
> Una aplicación mobile-first que conecta movilidad, puntos de interés, eventos, alertas urbanas y control de gastos de viaje para ayudar a las personas a decidir cómo explorar una ciudad. Pilotos: Cancún y CDMX.

## Inicio inmediato para humanos y agentes

**No recorras el repositorio entero.** Identifica tu tarea y abre solo las rutas señaladas:

| Necesito... | Leer primero | Después |
| --- | --- | --- |
| Entender la idea y alcance | [`docs/00-product/vision.md`](docs/00-product/vision.md) | [`docs/00-product/scope-mvp.md`](docs/00-product/scope-mvp.md) |
| Ejecutar bootstrap completo con otro agente | [`docs/agent/PROMPT_MAESTRO.md`](docs/agent/PROMPT_MAESTRO.md) | [`AGENTS.md`](AGENTS.md) |
| Trabajar como agente | [`AGENTS.md`](AGENTS.md) | [`docs/agent/WORKFLOW.md`](docs/agent/WORKFLOW.md) |
| Buscar un archivo sin explorar | [`docs/FILEMAP.md`](docs/FILEMAP.md) | [`docs/agent/ROUTER.md`](docs/agent/ROUTER.md) |
| Modificar UI/UX | [`docs/03-design/ux-rules.md`](docs/03-design/ux-rules.md) | `apps/web/src/` |
| Modificar el mapa | [`docs/02-modules/map.md`](docs/02-modules/map.md) | `apps/web/src/features/map/` |
| Integrar rutas/ciudades | [`docs/02-modules/cities-and-transit.md`](docs/02-modules/cities-and-transit.md) | `apps/api/src/modules/cities/` |
| Trabajar con inundaciones | [`docs/02-modules/reports.md`](docs/02-modules/reports.md) | `apps/api/src/modules/reports/` |
| Trabajar con eventos/POI | [`docs/02-modules/discovery.md`](docs/02-modules/discovery.md) | `apps/web/src/features/discovery/` |
| Trabajar con finanzas | [`docs/02-modules/budget.md`](docs/02-modules/budget.md) | `apps/web/src/features/budget/` |
| API y PostgreSQL | [`docs/04-api/contract.md`](docs/04-api/contract.md) | `apps/api/src/`, `db/migrations/` |
| Tomar decisiones de arquitectura | [`docs/01-architecture/overview.md`](docs/01-architecture/overview.md) | [`docs/adr/`](docs/adr/) |
| Preparar demo y calidad | [`docs/05-delivery/demo.md`](docs/05-delivery/demo.md) | [`docs/05-delivery/checklist.md`](docs/05-delivery/checklist.md) |
| Ver tareas del hackatón | [`docs/05-delivery/backlog.md`](docs/05-delivery/backlog.md) | [`docs/agent/WORKFLOW.md`](docs/agent/WORKFLOW.md) |
| Revisar fuentes/limitaciones | [`docs/06-data/sources.md`](docs/06-data/sources.md) | [`docs/06-data/data-policy.md`](docs/06-data/data-policy.md) |

## Tecnologías acordadas por el equipo

- **Frontend:** React, HTML, JavaScript/JSX, Tailwind CSS y Vite. Experiencia mobile-first/PWA progresiva.
- **Backend:** Node.js, TypeScript y Express.
- **Base de datos:** PostgreSQL (SQL versionado en `db/migrations/`).
- **Mapas:** MapLibre + datos OpenStreetMap con atribución/licencia adecuada.
- **Monorepo:** npm workspaces, sin microservicios ni infraestructura extra innecesaria.

## Primer arranque

```bash
cp apps/api/.env.example apps/api/.env
npm install
npm run dev
```

La API arranca con información descriptiva de dos ciudades sin necesitar base de datos. Para persistencia real: configurar `DATABASE_URL`, crear PostgreSQL y ejecutar las migraciones documentadas en `db/README.md`.

## Reglas de oro

1. **Proyecto nuevo hoy:** no copiar código, git history o plantillas cerradas de Larpatron/Rutas Cancún. Solo puede consumirse una API preexistente si lo permiten las reglas del hackatón; declarar su procedencia.
2. **Valor antes que volumen:** flujo vertical funcional, no diez pantallas de demostración.
3. **Datos verificables:** etiquetar `REAL`, `DEMO`, `USER_REPORTED`, `UNVERIFIED`, fecha y fuente; jamás inventar datos en vivo.
4. **Finanzas honestas:** registro manual/CSV; no asumir lectura de transacciones de Google Wallet/Google Pay ni pedir CVV/PAN/credenciales bancarias.
5. **Cambios pequeños:** un objetivo, pruebas pertinentes y documentación/rutas actualizadas por cambio.

## Estado inicial

- [x] Repositorio local inicializado el 20/11/2026, sin clonar plantillas.
- [x] Harness documental inicial y esqueleto React/Express.
- [ ] Instalación de dependencias y compilación: **no verificadas** debido a timeout de red del entorno.
- [ ] Reglas exactas de Larpatron: **pendiente de acceso verificable**.
- [ ] Datos de rutas y fuentes oficiales: adaptadores **pendientes de conexión**.
- [ ] CRUD, motor de decisiones, migraciones ejecutadas y demo: **pendientes**.

**Para contexto adicional:** [`docs/INDEX.md`](docs/INDEX.md) · [`AGENTS.md`](AGENTS.md).
