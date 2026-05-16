#!/usr/bin/env bash
set -euo pipefail

API_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$API_ROOT"

export DATABASE_DSN="${DATABASE_DSN:-host=localhost user=hackuser password=h4ckPass@549sSijfl_sD dbname=hackathondb port=5436 sslmode=disable TimeZone=UTC}"

echo "==> Running migrations (DATABASE_DSN=$DATABASE_DSN)"
go run ./cmd/migrate
