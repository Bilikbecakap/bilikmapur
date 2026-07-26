import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  const tok = cookieStore.get("admin_tok")?.value;
  return !!tok && tok === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ pesan: "Unauthorized" }, { status: 401 });
  }

  const { id, catatan_admin } = await req.json();
  if (!id) {
    return NextResponse.json({ pesan: "ID usulan diperlukan." }, { status: 400 });
  }

  const { rowCount } = await pool.query(
    `UPDATE submissions
     SET status = 'rejected',
         catatan_admin = $1,
         diputuskan_pada = now()
     WHERE id = $2 AND status = 'pending'`,
    [catatan_admin?.trim() || null, id]
  );

  if (!rowCount) {
    return NextResponse.json(
      { pesan: "Usulan tidak ditemukan atau sudah diproses." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
