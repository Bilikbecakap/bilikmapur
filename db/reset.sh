#!/usr/bin/env bash
# LOKAL SAJA — hapus semua tabel app untuk mulai bersih.
# JANGAN jalankan di produksi.
set -euo pipefail

DB_URL="${1:-${DATABASE_URL:?Berikan DATABASE_URL sebagai argumen atau export variable-nya}}"

read -p "Ini akan DROP semua tabel app. Lanjutkan? [y/N] " confirm
[[ "$confirm" == [yY] ]] || { echo "Dibatalkan."; exit 0; }

psql "$DB_URL" -c "DROP TABLE IF EXISTS modul, video, halaman, artikel, submissions, entries, kategori, users CASCADE;"
echo "Tabel app telah dihapus."
