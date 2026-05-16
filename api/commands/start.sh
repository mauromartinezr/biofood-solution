#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

export PORT="${PORT:-8080}"
export DATABASE_DSN="${DATABASE_DSN:-host=postgres3 user=hackuser password=h4ckPass@549sSijfl_sD dbname=hackathondb port=5432 sslmode=disable TimeZone=UTC}"

BIN="${BIN:-bin/biofood-server}"

if [[ ! -x "$BIN" ]]; then
  echo "Binary not found: $BIN — run 'make build' first."
  exit 1
fi

echo "==> API prod (PORT=$PORT, DATABASE_DSN=$DATABASE_DSN)"
exec "$BIN"
