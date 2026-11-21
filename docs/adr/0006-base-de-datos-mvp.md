# ADR-0006 — Esquema de base de datos del MVP

**Fecha:** 2026-11-20 · **Estado:** Aceptado

## Contexto
Hacía falta un esquema que cubriera todo el alcance del MVP (lugares, eventos, zonas, transporte, incidencias, procedencia) con datos simulados para la demo, sin romper las reglas: datos honestos, sin PostGIS sin caso real, nunca editar una migración fusionada y presupuesto local-first.

## Decisión
1. **Migración `0002_mvp_schema.sql` que solo añade** sobre `0001`: tablas `data_sources`, `categories`, `districts`, `transit_routes`, `transit_stops`, `transit_route_stops`, y columnas nuevas en `cities`, `places`, `events`, `urban_reports`.
2. **Procedencia normalizada** en `data_sources`; cada fila apunta a su fuente. Las columnas de texto de fuente de `0001` en `places` quedan como legado opcional.
3. **Sin PostGIS:** `lat`/`lon` con índices compuestos y GeoJSON en `JSONB` para polígonos y líneas.
4. **Categorías como tabla** (ids compartidos con la web), no como `CHECK`: añadir una categoría no requiere migración.
5. **Seeds separados de las migraciones** (`db/seeds/`, `npm run db:seed`): repetibles, con DEMO regenerado relativo a hoy. Transporte y zonas sin seeds: solo con fuente real.
6. **Presupuesto sin tablas** (OPEN-QUESTIONS #5 sigue vigente).
7. **Tests del esquema** (`apps/api/src/shared/db.schema.test.ts`) que la CI corre contra PostgreSQL.

## Consecuencias
- Los módulos pueden empezar a leer de la BD sin más migraciones para el MVP. El trabajo pendiente está en los issues con la etiqueta `base-de-datos`.
- `source_id` nació nullable en `places`/`events` por compatibilidad con `0001`. La migración `0003_source_id_not_null.sql` (2026-11-21) lo dejó `NOT NULL` y retiró `places.source_name`, `source_url` y `license`; nombre, URL y licencia quedan en `data_sources`. El único `(source_id, external_id)` no cambia.
- Si se necesita "lugares cerca de mí" a escala, reconsiderar PostGIS con un ADR nuevo.
