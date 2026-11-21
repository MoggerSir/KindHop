# Base de datos

PostgreSQL. SQL versionado en `db/migrations/NNNN_descripcion.sql`, aplicado en orden por `apps/api/src/shared/migrate.ts`, que registra cada archivo en `schema_migrations` (idempotente).

```bash
docker compose up -d db                                   # o un PostgreSQL local
cp apps/api/.env.example apps/api/.env                    # descomentar DATABASE_URL
npm run db:migrate
npm run db:seed      # catálogo + datos DEMO; repetible
```

Reglas: nunca editar una migración ya fusionada en `main` (crear la siguiente); estados con `CHECK`; dinero en `BIGINT` de centavos; tiempos `TIMESTAMPTZ`. La API arranca sin base de datos (`getPool()` solo se llama desde módulos que persisten).

| Migración | Contenido | Verificada |
|---|---|---|
| `0001_init.sql` | `cities` (+ semilla Cancún/CDMX), `places`, `events`, `urban_reports` con índices y CHECKs | 20/11/2026 en PostgreSQL 16, aplicada 2 veces sin error |
| `0002_mvp_schema.sql` | `data_sources`, `categories`, `districts`, `transit_*`; procedencia, imagen con crédito e i18n en `places`/`events`; moderación en `urban_reports` | 20/11/2026 en PostgreSQL 17, aplicada 2 veces sin error |

**Seeds** (`db/seeds/`, `npm run db:seed`, repetibles): catálogo de fuentes y categorías + datos DEMO (10 lugares, 7 eventos, 3 incidencias) con fechas relativas a hoy.

Arquitectura, diagrama y diccionario de cada tabla: [`docs/06-data/database.md`](../docs/06-data/database.md).

## Demo desplegada (KH-016 · Refs #10)

PostgreSQL gestionado **gratuito** para la API en producción; la credencial vive solo en secretos del hosting (nunca en el repo ni en `VITE_*`).

### Comparativa rápida (PostgreSQL 16+, nov 2026)

| Proveedor | Gratis | Límites relevantes | Pausa / sleep | Región útil para MX |
|---|---|---|---|---|
| **Neon** (recomendado) | Sí | ~0,5 GB, ramas de BD, conexión pooling | Escala a cero tras inactividad (~5 s al despertar) | `aws-us-east-1` u otra US |
| Supabase | Sí | ~500 MB proyecto | Proyecto pausa tras ~7 días sin uso (hay que reactivar) | US/EU |
| ElephantSQL | Sí (“Tiny”) | 20 MB, 5 conexiones | Sin pausa, pero muy pequeño para seeds DEMO | US/EU |

**Recomendación:** **Neon** — plan free con PostgreSQL 16+, URL con SSL, suficiente para migraciones + seeds DEMO, y despierta rápido para la demo del hackatón.

### Pasos (dueño del repo; sin coste en plan free)

1. Crear proyecto en [Neon](https://neon.tech) (región US), base `kindhop`, usuario con contraseña generada.
2. Copiar la **connection string** (`postgresql://…`) al secreto `DATABASE_URL` del host de la API (Render, Railway, Fly.io, etc.).
3. En el mismo entorno de despliegue, añadir `DATABASE_SSL=true` y `DATABASE_SSL_REJECT_UNAUTHORIZED=false` si la conexión falla por certificado (habitual en Neon).
4. **Antes del primer arranque** o en un job de release, desde CI o máquina local con acceso de red a la BD:
   ```bash
   export DATABASE_URL='postgresql://…'   # el valor real solo en secretos del proveedor
   export DATABASE_SSL=true
   npm run db:migrate && npm run db:seed
   ```
5. **Antes de presentar la demo:** volver a ejecutar `npm run db:seed` contra la misma BD (regenera eventos DEMO con fechas relativas a “hoy”).
6. Comprobar `GET /health` en la API desplegada: `database.configured` y `database.connected` en `true`.

Alternativa aceptable: Supabase (mismo flujo de secretos + migrate/seed); vigilar la pausa por inactividad la semana previa al hackatón.
