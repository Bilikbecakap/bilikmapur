#!/usr/bin/env bash
# Jalankan semua migrasi berurutan. Idempoten — aman diulang.
# Penggunaan:
#   ./db/run-migrations.sh "postgres://mapur:password@127.0.0.1:5432/mapur"
#   export DATABASE_URL=...; ./db/run-migrations.sh
set -euo pipefail

DB_URL="${1:-${DATABASE_URL:?Berikan DATABASE_URL sebagai argumen atau export variable-nya}}"
MIGRATIONS_DIR="$(dirname "$0")/migrations"

for f in "$MIGRATIONS_DIR"/0*.sql; do
  echo "→ $(basename "$f")"
  psql "$DB_URL" -f "$f"
done

echo "Selesai."
