# Módulo: incidencias urbanas (encharcamientos / inundaciones)

**Qué hace:** reportes comunitarios con fecha, estado y caducidad. **No es una fuente oficial ni garantiza que una ruta sea segura.**
**Dónde:** API `apps/api/src/modules/reports/` (`reports.db.ts`, `routes.ts`); tabla `urban_reports` (`db/migrations/0001_init.sql`, moderación en `0002`); web `apps/web/src/features/reports/` (KH-012, aún no).
**Datos:** `kind` `FLOOD|PUDDLE`; `lat`/`lon` redondeados a 3 decimales (≈ 100 m) en la API antes de guardar; `description ≤ 500`; el `POST` guarda `status = UNVERIFIED` y `dataStatus = USER_REPORTED` (`DEMO` solo viene del seed); `expiresAt = now() + 6 h`. `confirmCount` suma confirmaciones y no cambia el estado. La moderación escribe `status`, `moderatedAt` y `moderationNote`.

| Pieza | Estado |
|---|---|
| Esquema SQL con CHECKs de estados y caducidad | IMPLEMENTADO |
| GET de no caducadas, POST con zod, límite por IP, confirmar y moderación por token | IMPLEMENTADO (KH-011) |
| Capa, formulario, antigüedad visible, etiqueta DEMO en el pitch | PLANIFICADO (KH-012) |

**Privacidad:** sin cuenta y sin IP en la base. El límite (10 escrituras por IP cada 10 minutos, crear y confirmar juntos) es un contador en la memoria del proceso: se olvida al salir de la ventana o al reiniciar, y no se comparte entre instancias. Fotos fuera del MVP. Sin cuentas, la misma persona puede confirmar más de una vez hasta agotar el límite; no se presenta como un voto único.

**Moderación:** `PATCH /api/cities/:cityId/reports/:id` con `Authorization: Bearer` igual a `REPORTS_ADMIN_TOKEN` (ver `apps/api/.env.example`). Sin la variable, o con otro valor, responde 401. El token no va en el repositorio.

**Prueba:** `apps/api/src/modules/reports/reports.test.ts` — caducada no aparece, entrada inválida → 400, estado inicial `UNVERIFIED`, los 3 DEMO del seed con `dataStatus: DEMO`, redondeo, 429 y moderación. Necesita `DATABASE_URL` con migraciones y seeds; sin ella ese bloque se salta.

**Terminado cuando:** un reporte se crea, aparece con su estado y desaparece al caducar. La capa en el mapa es KH-012.
