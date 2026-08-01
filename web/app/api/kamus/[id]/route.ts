import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";
import { withActivityLog } from "@/lib/activityLog";

function unauth() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauth();

  const { id } = await params;
  const [{ rows }, { rows: kategoriList }] = await Promise.all([
    pool.query(
      `SELECT e.id, e.lema, e.arti_indonesia,
              e.contoh_kalimat_mapur, e.contoh_kalimat_indonesia,
              e.pelafalan_ipa, e.catatan, e.sumber, e.status,
              e.kategori_id
       FROM entries e WHERE e.id = $1 AND e.dihapus_pada IS NULL`,
      [id]
    ),
    pool.query("SELECT id, nama FROM kategori WHERE dihapus_pada IS NULL ORDER BY urutan, nama"),
  ]);

  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ entry: rows[0], kategoriList });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauth();

  const { id } = await params;
  const body = await req.json();

  let sukses = false;
  await withActivityLog(session, { aksi: "edit", tipeKonten: "entry", targetId: id }, async (client) => {
    const { rows } = await client.query(
      `UPDATE entries SET
         lema = $1, arti_indonesia = $2, kategori_id = $3,
         contoh_kalimat_mapur = $4, contoh_kalimat_indonesia = $5,
         pelafalan_ipa = $6, catatan = $7, sumber = $8, status = $9,
         diperbarui_pada = now()
       WHERE id = $10 AND dihapus_pada IS NULL RETURNING lema`,
      [
        (body.lema ?? "").trim(),
        (body.arti_indonesia ?? "").trim(),
        body.kategori_id || null,
        (body.contoh_kalimat_mapur ?? "").trim() || null,
        (body.contoh_kalimat_indonesia ?? "").trim() || null,
        (body.pelafalan_ipa ?? "").trim() || null,
        (body.catatan ?? "").trim() || null,
        (body.sumber ?? "").trim() || null,
        body.status ?? "published",
        id,
      ]
    );
    sukses = !!rows[0];
    return rows[0] ? { ringkasan: `Lema "${rows[0].lema}"` } : null;
  });

  if (!sukses) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
