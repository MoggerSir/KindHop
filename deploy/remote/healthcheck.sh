#!/usr/bin/env bash
# Cron cada 5 min (KH-026): si KinHop no responde de punta a punta, levanta lo que falte y reinicia API y web.
set -uo pipefail
source /opt/kinhop/bin/lib.sh
# El log no crece sin límite.
[[ -f "$KINHOP_DIR/logs/health.log" && $(stat -c %s "$KINHOP_DIR/logs/health.log") -gt 1048576 ]] && : > "$KINHOP_DIR/logs/health.log"
healthy && exit 0
log "sin salud: levantando servicios"
dc up -d
sleep 20
healthy && { log "recuperado con up -d"; exit 0; }
dc restart api web
sleep 20
healthy && log "recuperado con restart" || log "SIGUE CAÍDO: revisar 'docker compose logs' en /opt/kinhop"
