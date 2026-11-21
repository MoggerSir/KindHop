# Utilidades comunes de los scripts del VPS (KH-026).
KINHOP_DIR=/opt/kinhop
dc() { docker compose --project-directory "$KINHOP_DIR" --env-file "$KINHOP_DIR/.env" -f "$KINHOP_DIR/compose.yml" "$@"; }
log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*"; }
# Salud de punta a punta dentro del VPS: kinhop-web → API → Postgres, y el túnel de Cloudflare conectado.
# Se comprueba desde el propio kinhop-web (red interna), sin depender del Caddy edge compartido.
web_ok() { dc exec -T kinhop-web wget -qO- -T 5 http://127.0.0.1/health 2>/dev/null | grep -q '"connected":true'; }
tunnel_ok() { dc exec -T kinhop-web wget -qO- -T 5 http://cloudflared:2000/ready >/dev/null 2>&1; }
healthy() { web_ok && tunnel_ok; }
tsx() { dc run --rm --no-deps -T api node_modules/.bin/tsx "$@"; }
