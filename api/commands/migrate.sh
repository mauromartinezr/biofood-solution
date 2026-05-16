#!/usr/bin/env bash
set -euo pipefail

API_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$API_ROOT"

export DATABASE_DSN="${DATABASE_DSN:-biofood.db}"

echo "==> Running migrations (DATABASE_DSN=$DATABASE_DSN)"
go run ./cmd/migrate
