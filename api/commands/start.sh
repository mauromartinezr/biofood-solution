#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

for env_file in api/.env api/.env.dev api/.env.local; do
  if [[ -f "$env_file" ]]; then
    set -a
    # shellcheck disable=SC1090
    . "$env_file"
    set +a
  fi
done

export PORT="${PORT:-8080}"
export DATABASE_DSN="${DATABASE_DSN:-host=localhost user=hackuser password=h4ckPass@549sSijfl_sD dbname=hackathondb port=5436 sslmode=disable TimeZone=UTC}"

BIN="${BIN:-bin/biofood-server}"

if [[ ! -x "$BIN" ]]; then
  echo "Binary not found: $BIN — run 'make build' first."
  exit 1
fi

echo "==> API prod (PORT=$PORT, DATABASE_DSN=$DATABASE_DSN)"
exec "$BIN"
