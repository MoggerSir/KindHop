#!/usr/bin/env bash
# Comando forzado de la llave SSH de GitHub Actions (authorized_keys: command="/opt/kinhop/bin/ci-entry.sh",restrict).
# La llave solo puede: recibir un paquete y desplegarlo, o lanzar una acción de mantenimiento de la lista.
# Se instala a mano una vez (docs/05-delivery/despliegue.md); el despliegue NO lo sobrescribe.
set -euo pipefail
cmd="${SSH_ORIGINAL_COMMAND:-}"
if [[ "$cmd" =~ ^deploy\ ([0-9a-f]{40})$ ]]; then
  sha="${BASH_REMATCH[1]}"
  rel="/opt/kinhop/releases/$sha"
  rm -rf "$rel" && mkdir -p "$rel"
  tar -xzf - -C "$rel"
  exec bash "$rel/remote/deploy.sh" "$sha" "$rel"
elif [[ "$cmd" =~ ^maintenance\ (reseed|import-data|restart|status|backup)$ ]]; then
  exec bash /opt/kinhop/bin/maintenance.sh "${BASH_REMATCH[1]}"
else
  echo "Comando no permitido" >&2
  exit 2
fi
