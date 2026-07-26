#!/usr/bin/env bash
# pg_dump nightly → Cloudflare R2
# Dikonfigurasi dan dijadwalkan (cron) di Fase 8.
# Membutuhkan: aws-cli (dikonfigurasi dengan R2 credentials), DATABASE_URL, R2_BUCKET, R2_ENDPOINT.
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="mapur_${TIMESTAMP}.sql.gz"
TMP="/tmp/${BACKUP_FILE}"

pg_dump "${DATABASE_URL}" | gzip > "$TMP"

aws s3 cp "$TMP" "s3://${R2_BUCKET}/backups/${BACKUP_FILE}" \
  --endpoint-url="${R2_ENDPOINT}"

rm "$TMP"
echo "Backup selesai: backups/${BACKUP_FILE}"
