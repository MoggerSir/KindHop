# Base de datos

PostgreSQL. SQL versionado en `db/migrations/NNNN_descripcion.sql`, aplicado en orden por `apps/api/src/shared/migrate.ts`, que registra cada archivo en `schema_migrations` (idempotente).

```bash
docker compose up -d db                                   # o un PostgreSQL local
cp apps/api/.env.example apps/api/.env                    # descomentar DATABASE_URL
npm run db:migrate
```

Reglas: nunca editar una migración ya fusionada en `main` (crear la siguiente); estados con `CHECK`; dinero en `BIGINT` de centavos; tiempos `TIMESTAMPTZ`. La API arranca sin base de datos (`getPool()` solo se llama desde módulos que persisten).

| Migración | Contenido | Verificada |
|---|---|---|
| `0001_init.sql` | `cities` (+ semilla Cancún/CDMX), `places`, `events`, `urban_reports` con índices y CHECKs | 20/11/2026 en PostgreSQL 16, aplicada 2 veces sin error |
