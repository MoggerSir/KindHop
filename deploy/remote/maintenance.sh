#!/usr/bin/env bash
# Mantenimiento de KinHop en el VPS (KH-026). Lo llama cron o el workflow "Mantenimiento" de GitHub Actions.
set -euo pipefail
source /opt/kinhop/bin/lib.sh
cd "$KINHOP_DIR"
case "${1:-}" in
  reseed)
    # Las fechas DEMO son relativas a hoy: sin esto, los eventos de ejemplo pasan y Inicio se queda vacío.
    tsx apps/api/src/shared/seed.ts && log "seeds aplicados" ;;
  import-data)
    dc run --rm --no-deps -T -e OVERPASS_URL=https://overpass.openstreetmap.fr/api/interpreter api node_modules/.bin/tsx scripts/fetch-osm-pois.mjs
    dc run --rm --no-deps -T api node_modules/.bin/tsx scripts/import-cdmx-gtfs.mjs
    log "datos importados" ;;
  restart)
    dc up -d && dc restart api web && sleep 15 && healthy && log "reiniciado" ;;
  backup)
    f="backups/kinhop-$(date -u +%F).sql.gz"
    dc exec -T db pg_dump -U kinhop -d kinhop | gzip > "$f"
    ls -1t backups/kinhop-*.sql.gz | tail -n +8 | xargs -r rm -f
    log "respaldo $f" ;;
  status)
    dc ps
    healthy && echo "SALUD: OK" || { echo "SALUD: FALLA"; exit 1; } ;;
  *) echo "uso: maintenance.sh reseed|import-data|restart|backup|status" >&2; exit 2 ;;
esac
