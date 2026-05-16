#!/usr/bin/env bash
set -euo pipefail

API_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$API_ROOT"

export PORT="${PORT:-8080}"
export DATABASE_DSN="${DATABASE_DSN:-biofood.db}"

echo "==> API dev (PORT=$PORT, DATABASE_DSN=$DATABASE_DSN)"
go run ./cmd/server
