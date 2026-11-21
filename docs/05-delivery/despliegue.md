# Despliegue de la demo pública (KH-026)

**URL:** https://kinhop.campusconnet.com.mx · **Cuenta para el jurado:** botón «Entrar con la cuenta demo» (Pro simulado), o Google.

## Cómo funciona

```
push a main ──► GitHub Actions "Deploy"
                 1. CI completa (ci.yml reutilizada: check, build, migraciones y tests con PostgreSQL)
                 2. construye kinhop-api y kinhop-web (el VPS no compila)
                 3. las envía por SSH a una llave restringida que solo puede desplegar
VPS /opt/kinhop  4. deploy.sh: carga imágenes → migra → siembra → (1.ª vez) importa OSM y Metrobús
                 5. levanta y comprueba salud de punta a punta; si falla, vuelve a la versión anterior
                 6. Actions comprueba la URL pública
```

Cadena de una petición: Cloudflare (proxy, único origen permitido por UFW) → Caddy `edge` del VPS (TLS) → `kinhop-web` (Caddy interno: estáticos + `/api`) → `api` (Express) → `db` (PostgreSQL 17, sin puertos publicados).

| Pieza | Dónde |
|---|---|
| Imágenes | `deploy/Dockerfile.api`, `deploy/Dockerfile.web`, `deploy/Caddyfile.web` |
| Servicios en el VPS | `deploy/compose.yml` (proyecto `kinhop`, red interna + red externa `edge`) |
| Scripts del VPS | `deploy/remote/` → instalados en `/opt/kinhop/bin` en cada despliegue |
| Workflows | `.github/workflows/deploy.yml` (push a `main`), `maintenance.yml` (manual) |
| Secretos de la app | `/opt/kinhop/.env` (600) en el VPS. Nunca en Git ni en GitHub |
| Secretos de Actions | `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS`, `VPS_HOST`, `VPS_PORT`, `VPS_USER` |

## Para que no se caiga

- **Reinicio automático:** `restart: unless-stopped` y healthcheck en cada contenedor; límites de memoria (db 256 MB, api 384 MB, web 64 MB).
- **Vigilancia cada 5 min** (cron del VPS, `healthcheck.sh`): si `kinhop-web/health` no responde con la base conectada, hace `up -d` y, si sigue mal, reinicia API y web. Registro en `/opt/kinhop/logs/health.log`.
- **Fechas DEMO frescas:** cada día a las 09:10 UTC (`maintenance.sh reseed`). Sin esto, los eventos de ejemplo pasan y el Inicio queda vacío.
- **Respaldo diario** de PostgreSQL a las 08:40 UTC en `/opt/kinhop/backups` (se guardan 7).
- **Despliegue sin riesgo:** las migraciones solo añaden; si la nueva versión no pasa la salud, vuelve sola a la anterior. Un despliegue a la vez (`concurrency`).
- **Llave de Actions limitada:** `authorized_keys` con `command="/opt/kinhop/bin/ci-entry.sh",restrict`: solo acepta `deploy <sha>` y `maintenance <acción>`.

## Operación

- **Mantenimiento sin entrar al VPS:** Actions → *Maintenance* → *Run workflow* → `status`, `reseed`, `restart`, `import-data` o `backup`.
- **En el VPS:** `ssh campusconnect-vps` → `/opt/kinhop/bin/maintenance.sh status`; logs con `docker compose -p kinhop logs --tail 100 api`.
- **Volver a una versión:** cambiar `KINHOP_TAG` en `/opt/kinhop/.env` a una etiqueta de `docker images kinhop-api` y `docker compose -p kinhop --project-directory /opt/kinhop up -d api web`.

## Configuración única (hecha el 21/11/2026)

1. `/opt/kinhop` con `.env` (contraseña de Postgres y `SESSION_SECRET` aleatorios, credenciales de Google, `PUBLIC_URL`/`WEB_ORIGIN`, `AUTH_DEV_LOGIN=true`, `AUTH_DEMO_IN_PRODUCTION=true`).
2. `ci-entry.sh` en `/opt/kinhop/bin` y la llave de Actions en `~deploy/.ssh/authorized_keys` con el comando forzado.
3. Bloque `kinhop.campusconnet.com.mx` en `/opt/stickerrip/deploy/Caddyfile.edge` (respaldo `Caddyfile.edge.before-kinhop-*`), con cabeceras propias porque el mapa usa geolocalización.
4. **Pendiente del dueño:** en Cloudflare, registro `A kinhop → 66.29.133.32` con proxy (nube naranja), y SSL de la zona en *Full* o *Full (strict)* (con *Flexible* hay bucle de redirecciones). En Google Cloud (proyecto KindHop): añadir `https://kinhop.campusconnet.com.mx/api/auth/google/callback` a los URI de redirección y publicar la pantalla de consentimiento (en modo prueba solo entran los testers).
