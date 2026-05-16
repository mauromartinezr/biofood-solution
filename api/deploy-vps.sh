#!/usr/bin/env bash
# Sincroniza api/ (y opcionalmente web/) al VPS.
#
# Uso:
#   ./api/deploy-vps.sh user@mi-vps:/opt/biofood
#   ./api/deploy-vps.sh user@mi-vps:/opt/biofood --full   # incluye web/ (SPA embebida)
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Uso: $0 user@host:/ruta/remota [--full]"
  exit 1
fi

DEST="$1"
FULL="${2:-}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="$ROOT/api"

RSYNC_OPTS=(-avz --delete \
  --exclude bin/ \
  --exclude '*.db' \
  --exclude cmd/server/dist/ \
  --exclude .git/ \
  --exclude .context-course/)

echo "==> Subiendo api/ a $DEST/api/"
rsync "${RSYNC_OPTS[@]}" "$API_DIR/" "$DEST/api/"

if [[ "$FULL" == "--full" ]]; then
  echo "==> Subiendo web/ a $DEST/web/ (build completo con frontend)"
  rsync -avz --delete \
    --exclude node_modules/ \
    --exclude dist/ \
    "$ROOT/web/" "$DEST/web/"
  echo ""
  echo "En el VPS:"
  echo "  cd $DEST && docker compose -f api/docker-compose.yml up --build -d"
else
  echo ""
  echo "En el VPS (solo API, sin frontend embebido):"
  echo "  cd $DEST/api && docker compose -f docker-compose.api-only.yml up --build -d"
  echo ""
  echo "Para incluir web/, vuelve a ejecutar con --full"
fi
