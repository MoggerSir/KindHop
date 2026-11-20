# Módulo: incidencias urbanas (encharcamientos / inundaciones)

**Qué hace:** reportes comunitarios con fecha, estado y caducidad. **No es una fuente oficial ni garantiza que una ruta sea segura.**
**Dónde:** API `apps/api/src/modules/reports/`; tabla `urban_reports` en `db/migrations/0001_init.sql`; web `apps/web/src/features/reports/`.
**Datos:** `kind` `FLOOD|PUDDLE`, coordenadas redondeadas (≈100 m), `description ≤ 500`, `status` `UNVERIFIED → CONFIRMED|REJECTED → RESOLVED`, `dataStatus` `USER_REPORTED|DEMO`, `createdAt`, `expiresAt` (> `createdAt`, p. ej. +6 h).

| Pieza | Estado |
|---|---|
| Esquema SQL con CHECKs de estados y caducidad | IMPLEMENTADO |
| GET activos / POST con zod + límite por IP / moderación por token admin | PLANIFICADO (KH-011) |
| Capa, formulario, antigüedad visible, etiqueta DEMO en el pitch | PLANIFICADO (KH-012) |

**Privacidad:** sin cuenta, sin IP almacenada, sin historial de ubicación; fotos fuera del MVP.
**Prueba:** test "reporte caducado no aparece", "entrada inválida → 400", "estado inicial UNVERIFIED".
**Terminado cuando:** un reporte se crea, aparece con su estado y desaparece al caducar.
