#!/usr/bin/env bash
# Despliegue de una versión (KH-026): carga imágenes, migra, siembra, levanta y comprueba. Si falla, vuelve a la anterior.
set -euo pipefail
sha="$1"; rel="$2"
source "$rel/remote/lib.sh"
cd "$KINHOP_DIR"

log "cargando imágenes $sha"
docker load -i "$rel/images.tar" >/dev/null
cp "$rel/compose.yml" compose.yml
mkdir -p bin logs backups
install -m 755 "$rel/remote/lib.sh" "$rel/remote/deploy.sh" "$rel/remote/healthcheck.sh" "$rel/remote/maintenance.sh" bin/

prev="$(grep -E '^KINHOP_TAG=' .env | cut -d= -f2 || true)"
tag="${sha:0:12}"
docker tag "kinhop-api:$sha" "kinhop-api:$tag"
docker tag "kinhop-web:$sha" "kinhop-web:$tag"
set_tag() { if grep -qE '^KINHOP_TAG=' .env; then sed -i "s/^KINHOP_TAG=.*/KINHOP_TAG=$1/" .env; else echo "KINHOP_TAG=$1" >> .env; fi; }
set_tag "$tag"

rollback() {
  log "FALLO: $1"
  if [[ -n "$prev" && "$prev" != "$tag" ]]; then
    log "volviendo a $prev"
    set_tag "$prev"
    dc up -d --remove-orphans api kinhop-web
  fi
  exit 1
}

dc up -d db
for _ in $(seq 1 30); do dc exec -T db pg_isready -U kinhop -d kinhop >/dev/null 2>&1 && break; sleep 2; done

# Las migraciones solo añaden (ADR-0006): la versión anterior sigue funcionando si hay que volver.
tsx apps/api/src/shared/migrate.ts || rollback "migraciones"
tsx apps/api/src/shared/seed.ts || rollback "seeds"

# Primera vez: datos reales. Si Overpass no responde, la app arranca igual y se reintenta con mantenimiento.
osm="$(dc exec -T db psql -U kinhop -d kinhop -Atc "SELECT count(*) FROM places WHERE source_id = 'osm'" || echo 0)"
if [[ "$osm" == "0" ]]; then
  log "importando lugares de OpenStreetMap"
  dc run --rm --no-deps -T -e OVERPASS_URL=https://overpass.openstreetmap.fr/api/interpreter api node_modules/.bin/tsx scripts/fetch-osm-pois.mjs || log "AVISO: importación OSM fallida; reintentar con 'maintenance import-data'"
fi
cdmx="$(dc exec -T db psql -U kinhop -d kinhop -Atc "SELECT count(*) FROM transit_routes WHERE city_id = 'cdmx'" || echo 0)"
if [[ "$cdmx" == "0" ]]; then
  log "importando Metrobús CDMX"
  dc run --rm --no-deps -T api node_modules/.bin/tsx scripts/import-cdmx-gtfs.mjs || log "AVISO: importación CDMX fallida"
fi

dc up -d --remove-orphans api kinhop-web
for _ in $(seq 1 30); do healthy && break; sleep 3; done
healthy || rollback "la comprobación de salud no pasó"
log "desplegado $tag"

# Vigilancia, respaldo y fechas DEMO frescas por cron (idempotente: reemplaza solo las líneas de KinHop).
{ crontab -l 2>/dev/null | grep -v '# kinhop' || true
  echo "*/5 * * * * /opt/kinhop/bin/healthcheck.sh >> /opt/kinhop/logs/health.log 2>&1 # kinhop"
  echo "10 9 * * * /opt/kinhop/bin/maintenance.sh reseed >> /opt/kinhop/logs/maintenance.log 2>&1 # kinhop"
  echo "40 8 * * * /opt/kinhop/bin/maintenance.sh backup >> /opt/kinhop/logs/maintenance.log 2>&1 # kinhop"
} | crontab -

# Limpieza: últimas 3 versiones en disco; imágenes de KinHop que no son la actual ni la anterior.
ls -1dt releases/*/ 2>/dev/null | tail -n +4 | xargs -r rm -rf
for img in $(docker images --format '{{.Repository}}:{{.Tag}}' | grep -E '^kinhop-(api|web):'); do
  t="${img#*:}"
  [[ "$t" == "$tag" || "$t" == "$prev" ]] || docker rmi "$img" >/dev/null 2>&1 || true
done
