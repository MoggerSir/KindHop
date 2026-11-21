# Utilidades comunes de los scripts del VPS (KH-026).
KINHOP_DIR=/opt/kinhop
dc() { docker compose --project-directory "$KINHOP_DIR" --env-file "$KINHOP_DIR/.env" -f "$KINHOP_DIR/compose.yml" "$@"; }
log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*"; }
# Salud de punta a punta dentro del VPS: Caddy edge → kinhop-web → API → Postgres.
healthy() { docker exec edge-caddy-1 wget -qO- -T 5 http://kinhop-web/health 2>/dev/null | grep -q '"connected":true'; }
tsx() { dc run --rm --no-deps -T api node_modules/.bin/tsx "$@"; }
