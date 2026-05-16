#!/usr/bin/env bash
set -euo pipefail

API_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$API_ROOT"

if [ -z "${DATABASE_DSN:-}" ] && [ -f .env.local ]; then
  set -a && . ./.env.local && set +a
fi
export DATABASE_DSN="${DATABASE_DSN:-host=localhost user=hackuser password=h4ckPass@549sSijfl_sD dbname=hackathondb port=5436 sslmode=disable TimeZone=UTC}"

echo "==> Running migrations (DATABASE_DSN=$DATABASE_DSN)"
go run ./cmd/migrate
