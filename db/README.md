# Base de datos KindHop

PostgreSQL es el motor acordado. `db/migrations/` contiene SQL versionado. El bootstrap incluye un esquema inicial ilustrativo; **no significa que los módulos estén implementados**.

Para un ambiente local con Docker: `docker compose up -d db`. Después:

```bash
psql "$DATABASE_URL" -f db/migrations/0001_init.sql
```

Si PostgreSQL no está instalado, el endpoint `/health` y el catálogo estático `/api/cities` pueden ejecutarse sin BD. Nunca usar datos de producción durante la demo.
