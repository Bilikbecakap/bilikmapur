import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("q") ?? "";
  const q = raw.trim().toLowerCase().replace(/\s+/g, " ");

  if (q.length < 1) {
    return NextResponse.json({ hasil: [] });
  }

  try {
    const { rows } = await pool.query(
      `SELECT e.id, e.lema, e.arti_indonesia, k.nama AS kategori
       FROM entries e
       LEFT JOIN kategori k ON k.id = e.kategori_id
       WHERE e.status = 'published'
         AND e.dihapus_pada IS NULL
         AND (
           e.search @@ websearch_to_tsquery('simple', $1)
           OR e.lema % $1
           OR e.arti_indonesia % $1
         )
       ORDER BY
         (e.search @@ websearch_to_tsquery('simple', $1)) DESC,
         similarity(e.lema, $1) DESC
       LIMIT 20`,
      [q]
    );
    return NextResponse.json({ hasil: rows });
  } catch {
    return NextResponse.json(
      { hasil: [], error: "Gagal memproses pencarian" },
      { status: 500 }
    );
  }
}
