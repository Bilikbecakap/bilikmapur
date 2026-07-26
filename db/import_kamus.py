#!/usr/bin/env python3
"""Import kamus_mapur_gabungan.csv ke tabel entries dan kategori."""

import csv
import os
import re
import sys
import uuid
from datetime import datetime, timezone

try:
    import psycopg2
except ImportError:
    print("ERROR: psycopg2 tidak ditemukan. Jalankan: pip3 install psycopg2-binary")
    sys.exit(1)

CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "kamus_mapur_gabungan.csv")
DB_URL = os.environ.get("DATABASE_URL", "postgres://mapur:mapur@127.0.0.1:5432/mapur")


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[&,]", "-", text)
    text = re.sub(r"[^a-z0-9\-]", "", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def main():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    # 1. Baca CSV
    rows = []
    with open(CSV_PATH, newline="", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            rows.append(row)
    print(f"CSV dibaca: {len(rows)} baris")

    # 2. Kumpulkan semua kategori unik dari CSV
    csv_cats = sorted({r["kategori"].strip() for r in rows if r["kategori"].strip()})

    # 3. Upsert kategori (INSERT ... ON CONFLICT DO NOTHING)
    print(f"\nMenyinkronkan {len(csv_cats)} kategori...")
    for i, nama in enumerate(csv_cats, start=10):  # mulai urutan 10 agar tidak bentrok
        slug = slugify(nama)
        cur.execute(
            """
            INSERT INTO kategori (nama, slug, urutan)
            VALUES (%s, %s, %s)
            ON CONFLICT (slug) DO UPDATE SET nama = EXCLUDED.nama
            """,
            (nama, slug, i),
        )
        print(f"  [{slug}] {nama}")

    # 4. Ambil mapping slug → id
    cur.execute("SELECT slug, id FROM kategori")
    slug_to_id = {row[0]: row[1] for row in cur.fetchall()}

    # 5. Hapus semua entries
    cur.execute("DELETE FROM entries")
    print(f"\nEntries lama dihapus.")

    # 6. Insert entries baru
    print(f"Memasukkan {len(rows)} lema...")
    now = datetime.now(timezone.utc)
    inserted = skipped = 0

    for row in rows:
        lema = row["arti_mapur"].strip()
        arti = row["bahasa_indo"].strip()
        if not lema or not arti:
            skipped += 1
            continue

        slug = slugify(row["kategori"].strip())
        kat_id = slug_to_id.get(slug)

        cur.execute(
            """
            INSERT INTO entries (
                id, lema, arti_indonesia,
                contoh_kalimat_mapur, contoh_kalimat_indonesia,
                kategori_id, sumber, status,
                dibuat_pada, diperbarui_pada
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, 'published', %s, %s
            )
            """,
            (
                str(uuid.uuid4()),
                lema,
                arti,
                row["contoh_mapur"].strip() or None,
                row["terjemahan"].strip() or None,
                kat_id,
                row["id"].strip() or None,
                now,
                now,
            ),
        )
        inserted += 1

    conn.commit()
    cur.close()
    conn.close()

    print(f"\nSelesai: {inserted} lema dimasukkan, {skipped} dilewati.")
    if skipped:
        print("(Baris dilewati karena lema atau arti_indonesia kosong.)")


if __name__ == "__main__":
    main()
