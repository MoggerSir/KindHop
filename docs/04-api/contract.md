# API REST — contrato inicial

**Base:** `/api` · JSON · tiempos UTC ISO8601; errores consistentes `{ error: { code, message } }`. Los endpoints existentes hoy son limitados (leer abajo).

| Método | Ruta | Estado | Propósito |
|---|---|---|---|
| GET | `/health` | Implementado | Estado básico API |
| GET | `/api/cities` | Implementado | Ciudades disponibles |
| GET | `/api/cities/:cityId` | Implementado | Config pública de ciudad |
| GET | `/api/cities/:cityId/pois` | Planeado | POI y fuente |
| GET | `/api/cities/:cityId/transit` | Planeado | Rutas de transporte |
| GET | `/api/cities/:cityId/events` | Planeado | Eventos futuros |
| GET | `/api/cities/:cityId/reports` | Planeado | Incidencias activas |
| POST | `/api/cities/:cityId/reports` | Planeado | Reporte moderable |
| GET | `/api/me/budget` | Planeado | Presupuesto personal |
| POST | `/api/me/expenses` | Planeado | Registro gastos |

Las rutas `me/*` requieren un modelo de identidad definido antes de abrirse. No exponer endpoints de escritura públicos sin validación, límites, autorización y moderación apropiados. Mantener este contrato al día con código real, nunca marcar como implementado algo inexistente.
