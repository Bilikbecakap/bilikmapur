#!/usr/bin/env python3
"""
Gabungkan entri duplikat di tabel entries:
- Lema yang sama (case-insensitive) digabung jadi satu baris
- arti_indonesia digabung: "adat, budaya, tradisi"
- Lema dinormalisasi ke huruf kecil
- contoh_kalimat diambil dari baris pertama yang punya isi
- CSV diregenerasi dari database hasil akhir
"""

import csv
import os
import sys

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    print("ERROR: pip3 install psycopg2-binary")
    sys.exit(1)

DB_URL = os.environ.get("DATABASE_URL", "postgres://mapur:mapur@127.0.0.1:5432/mapur")
CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "kamus_mapur_gabungan.csv")


def main():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # ── 1. Ambil semua grup duplikat (case-insensitive) ──────────────────────
    cur.execute("""
        SELECT lower(lema) AS lema_lower,
               array_agg(id::text ORDER BY dibuat_pada) AS ids
        FROM entries
        GROUP BY lower(lema)
        HAVING COUNT(*) > 1
        ORDER BY lema_lower
    """)
    groups = cur.fetchall()
    print(f"Ditemukan {len(groups)} lema duplikat.\n")

    merged_count = 0
    deleted_count = 0

    for g in groups:
        ids = g["ids"]

        # Ambil semua baris dalam grup ini
        cur.execute("""
            SELECT id, lema, arti_indonesia,
                   contoh_kalimat_mapur, contoh_kalimat_indonesia,
                   kategori_id, sumber
            FROM entries
            WHERE id = ANY(%s::uuid[])
            ORDER BY dibuat_pada
        """, (ids,))
        rows = cur.fetchall()

        # Lema kanonik: huruf kecil, ambil dari baris pertama
        lema_baru = g["lema_lower"]

        # Gabungkan arti (deduplikasi, jaga urutan)
        seen = set()
        artis = []
        for r in rows:
            a = (r["arti_indonesia"] or "").strip()
            if a and a.lower() not in seen:
                seen.add(a.lower())
                artis.append(a)
        arti_baru = ", ".join(artis)

        # Contoh kalimat: ambil yang pertama tidak kosong
        contoh_mapur = next(
            (r["contoh_kalimat_mapur"] for r in rows if r["contoh_kalimat_mapur"]), None
        )
        contoh_indo = next(
            (r["contoh_kalimat_indonesia"] for r in rows if r["contoh_kalimat_indonesia"]), None
        )

        # Kategori: pilih yang paling sering muncul, atau pertama
        from collections import Counter
        kat_ids = [r["kategori_id"] for r in rows if r["kategori_id"]]
        kategori_id = Counter(kat_ids).most_common(1)[0][0] if kat_ids else None

        # Sumber: gabungkan semua ID CSV asli
        sumber_baru = ", ".join(
            r["sumber"] for r in rows if r["sumber"]
        )

        # ID yang dipertahankan (baris pertama), sisanya dihapus
        keep_id = ids[0]
        delete_ids = ids[1:]

        print(f"  [{lema_baru}]  {arti_baru}")

        # Update baris yang dipertahankan
        cur.execute("""
            UPDATE entries SET
                lema = %s,
                arti_indonesia = %s,
                contoh_kalimat_mapur = %s,
                contoh_kalimat_indonesia = %s,
                kategori_id = %s,
                sumber = %s,
                diperbarui_pada = now()
            WHERE id = %s::uuid
        """, (lema_baru, arti_baru, contoh_mapur, contoh_indo,
              kategori_id, sumber_baru or None, keep_id))

        # Hapus submissions yang referensikan baris yang akan dihapus (set NULL)
        cur.execute("""
            UPDATE submissions SET target_entry_id = NULL
            WHERE target_entry_id = ANY(%s::uuid[])
        """, (delete_ids,))

        # Hapus baris duplikat
        cur.execute("DELETE FROM entries WHERE id = ANY(%s::uuid[])", (delete_ids,))

        merged_count += 1
        deleted_count += len(delete_ids)

    conn.commit()
    print(f"\nSelesai: {merged_count} lema digabung, {deleted_count} baris dihapus.")

    # ── 2. Normalisasi lema non-duplikat ke huruf kecil ──────────────────────
    cur.execute("""
        UPDATE entries SET lema = lower(lema), diperbarui_pada = now()
        WHERE lema != lower(lema)
    """)
    fixed = cur.rowcount
    conn.commit()
    if fixed:
        print(f"Normalisasi kapitalisasi: {fixed} lema diubah ke huruf kecil.")

    # ── 3. Regenerasi CSV dari database ──────────────────────────────────────
    cur.execute("""
        SELECT e.sumber AS id,
               e.arti_indonesia AS bahasa_indo,
               e.lema AS arti_mapur,
               e.contoh_kalimat_mapur AS contoh_mapur,
               e.contoh_kalimat_indonesia AS terjemahan,
               k.nama AS kategori
        FROM entries e
        LEFT JOIN kategori k ON k.id = e.kategori_id
        WHERE e.status = 'published'
        ORDER BY e.lema
    """)
    rows = cur.fetchall()

    with open(CSV_PATH, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["id", "bahasa_indo", "arti_mapur", "contoh_mapur", "terjemahan", "kategori"],
        )
        writer.writeheader()
        for r in rows:
            writer.writerow({
                "id": r["id"] or "",
                "bahasa_indo": r["bahasa_indo"] or "",
                "arti_mapur": r["arti_mapur"] or "",
                "contoh_mapur": r["contoh_mapur"] or "",
                "terjemahan": r["terjemahan"] or "",
                "kategori": r["kategori"] or "",
            })

    print(f"CSV diperbarui: {len(rows)} baris → {CSV_PATH}")

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
