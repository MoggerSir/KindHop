# Base de datos

PostgreSQL. SQL versionado en `db/migrations/NNNN_descripcion.sql`, aplicado en orden por `apps/api/src/shared/migrate.ts`, que registra cada archivo en `schema_migrations` (idempotente).

```bash
docker compose up -d db                                   # o un PostgreSQL local
cp apps/api/.env.example apps/api/.env                    # descomentar DATABASE_URL
npm run db:migrate
npm run db:seed      # catálogo + datos DEMO; repetible
npm run db:import-osm   # lugares REAL de Cancún desde Overpass; repetible, no toca DEMO
npm run db:import:cdmx  # Metrobús línea 1 desde el fixture local; repetible, sin red
```

Reglas: nunca editar una migración ya fusionada en `main` (crear la siguiente); estados con `CHECK`; dinero en `BIGINT` de centavos; tiempos `TIMESTAMPTZ`. La API arranca sin base de datos (`getPool()` solo se llama desde módulos que persisten).

| Migración | Contenido | Verificada |
|---|---|---|
| `0001_init.sql` | `cities` (+ semilla Cancún/CDMX), `places`, `events`, `urban_reports` con índices y CHECKs | 20/11/2026 en PostgreSQL 16, aplicada 2 veces sin error |
| `0002_mvp_schema.sql` | `data_sources`, `categories`, `districts`, `transit_*`; procedencia, imagen con crédito e i18n en `places`/`events`; moderación en `urban_reports` | 20/11/2026 en PostgreSQL 17, aplicada 2 veces sin error |
| `0003_source_id_not_null.sql` | `places.source_id` y `events.source_id` obligatorios; rellena nulos DEMO con `kindhop-demo` o aborta; retira `source_name`, `source_url` y `license` de `places`. No toca el único `(source_id, external_id)` | 21/11/2026 en PostgreSQL 17, aplicada 2 veces sin error |

**Seeds** (`db/seeds/`, `npm run db:seed`, repetibles): catálogo de fuentes y categorías + datos DEMO (10 lugares, 7 eventos, 3 incidencias) con fechas relativas a hoy.

Arquitectura, diagrama y diccionario de cada tabla: [`docs/06-data/database.md`](../docs/06-data/database.md).

## Demo desplegada (KH-016 · Refs #10)

PostgreSQL gestionado **gratuito** para la API en producción; la credencial vive solo en secretos del hosting (nunca en el repo ni en `VITE_*`).

### Comparativa rápida (PostgreSQL 16+, verificada en pricing oficial, nov 2026)

Fuentes: [Neon pricing](https://neon.tech/pricing), [Supabase pricing](https://supabase.com/pricing), [Prisma pricing](https://www.prisma.io/pricing) (+ [Prisma Postgres](https://www.prisma.io/docs/postgres/overview)). *ElephantSQL dejó de operar en ene. 2025; no usarlo.*

| Proveedor | Gratis | Límites relevantes | Pausa / caducidad | Región útil para MX |
|---|---|---|---|---|
| **Neon** (recomendado) | $0 permanente | 1 GB almacenamiento/proyecto (20 GB total/cuenta), pooling, ramas | Escala a cero tras **5 min** sin tráfico (despierte ~segundos) | Elegible al crear proyecto (p. ej. US East) |
| Supabase | $0 permanente | 500 MB BD, CPU compartida, máx. **2 proyectos free** activos | Proyecto **pausado tras 1 semana** sin actividad | US / EU al crear proyecto |
| Prisma Postgres | $0 permanente | **PostgreSQL 17**, 2 GB, 200 k operaciones/mes, pooling (PgBouncer) | Sin pausa por inactividad en plan Free; BD temporal sin reclamar se borra a las 24 h | Infra Prisma (conexión `db.prisma.io`, TLS) |

Otras opciones free comprobadas pero con pegas para la demo: **Aiven** ([pricing](https://aiven.io/pricing)) — 1 GB, sin elegir región ni pooling en Free; **Render Postgres** ([free instances](https://render.com/docs/free)) — 1 GB pero la BD free **caduca a los 30 días** (malo si la demo dura más sin pagar).

**Recomendación:** **Neon** — plan Free permanente, PostgreSQL actual, URL con SSL, caben migraciones + seeds DEMO, y el cold start tras scale-to-zero suele ser aceptable para el pitch.

### Pasos (dueño del repo; sin coste en plan free)

1. Crear proyecto en [Neon](https://neon.tech) (región US), base `kindhop`, usuario con contraseña generada.
2. Copiar la **connection string** (`postgresql://…`) al secreto `DATABASE_URL` del host de la API (Render, Railway, Fly.io, etc.).
3. Si la connection string **no** incluye `sslmode` (poco habitual en Neon/Supabase), define `DATABASE_SSL=true` en secretos. Con `sslmode` en la URL, pg aplica TLS solo con ese parámetro (ver `apps/api/.env.example`).
4. **Antes del primer arranque** o en un job de release, desde CI o máquina local con acceso de red a la BD:
   ```bash
   export DATABASE_URL='postgresql://…?sslmode=require'   # valor real solo en secretos del proveedor
   npm run db:migrate && npm run db:seed
   ```
5. **Antes de presentar la demo:** volver a ejecutar `npm run db:seed` contra la misma BD (regenera eventos DEMO con fechas relativas a “hoy”).
6. Comprobar `GET /health` en la API desplegada: `database.configured` y `database.connected` en `true`.

Alternativas aceptables: **Supabase** (reactivar el proyecto si estuvo pausado) o **Prisma Postgres** (usar connection string directa para `npm run db:migrate`; pooling para la API). La semana previa al hackatón, tocar la BD o el dashboard para evitar pausas (Supabase) o sorpresas de caducidad (Render free).
