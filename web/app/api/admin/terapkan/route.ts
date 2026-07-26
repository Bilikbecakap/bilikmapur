import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  const tok = cookieStore.get("admin_tok")?.value;
  return !!tok && tok === process.env.ADMIN_SECRET;
}

interface DataUsulan {
  lema?: string;
  kategori_slug?: string | null;
  arti_indonesia?: string;
  contoh_kalimat_mapur?: string | null;
  contoh_kalimat_indonesia?: string | null;
  catatan?: string | null;
  sumber?: string | null;
  alasan?: string;
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ pesan: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ pesan: "ID usulan diperlukan." }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Ambil submission
    const { rows } = await client.query(
      `SELECT aksi, target_entry_id, data_usulan
       FROM submissions WHERE id = $1 AND status = 'pending'`,
      [id]
    );
    if (!rows[0]) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { pesan: "Usulan tidak ditemukan atau sudah diproses." },
        { status: 404 }
      );
    }

    const { aksi, target_entry_id, data_usulan } = rows[0] as {
      aksi: string;
      target_entry_id: string | null;
      data_usulan: DataUsulan;
    };

    if (aksi === "tambah") {
      // Cari kategori_id dari slug
      let kategoriId: number | null = null;
      if (data_usulan.kategori_slug) {
        const { rows: kr } = await client.query(
          "SELECT id FROM kategori WHERE slug = $1",
          [data_usulan.kategori_slug]
        );
        kategoriId = kr[0]?.id ?? null;
      }

      await client.query(
        `INSERT INTO entries
           (lema, kategori_id, arti_indonesia,
            contoh_kalimat_mapur, contoh_kalimat_indonesia, catatan, sumber, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'published')`,
        [
          data_usulan.lema ?? "",
          kategoriId,
          data_usulan.arti_indonesia ?? "",
          data_usulan.contoh_kalimat_mapur ?? null,
          data_usulan.contoh_kalimat_indonesia ?? null,
          data_usulan.catatan ?? null,
          data_usulan.sumber ?? null,
        ]
      );
    } else if (aksi === "edit") {
      if (!target_entry_id) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { pesan: "Target lema tidak ditemukan." },
          { status: 400 }
        );
      }

      let kategoriId: number | null = null;
      if (data_usulan.kategori_slug) {
        const { rows: kr } = await client.query(
          "SELECT id FROM kategori WHERE slug = $1",
          [data_usulan.kategori_slug]
        );
        kategoriId = kr[0]?.id ?? null;
      }

      await client.query(
        `UPDATE entries SET
           lema               = $1,
           kategori_id        = $2,
           arti_indonesia     = $3,
           contoh_kalimat_mapur    = $4,
           contoh_kalimat_indonesia = $5,
           catatan            = $6,
           sumber             = $7,
           diperbarui_pada    = now()
         WHERE id = $8`,
        [
          data_usulan.lema ?? "",
          kategoriId,
          data_usulan.arti_indonesia ?? "",
          data_usulan.contoh_kalimat_mapur ?? null,
          data_usulan.contoh_kalimat_indonesia ?? null,
          data_usulan.catatan ?? null,
          data_usulan.sumber ?? null,
          target_entry_id,
        ]
      );
    } else if (aksi === "hapus") {
      if (!target_entry_id) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { pesan: "Target lema tidak ditemukan." },
          { status: 400 }
        );
      }
      // Soft delete: arsipkan agar bisa dipulihkan via Directus
      await client.query(
        "UPDATE entries SET status = 'draft' WHERE id = $1",
        [target_entry_id]
      );
    } else {
      await client.query("ROLLBACK");
      return NextResponse.json({ pesan: "Aksi tidak dikenal." }, { status: 400 });
    }

    // Tandai submission sebagai approved
    await client.query(
      `UPDATE submissions
       SET status = 'approved', diputuskan_pada = now()
       WHERE id = $1`,
      [id]
    );

    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[terapkan]", err);
    return NextResponse.json(
      { pesan: "Terjadi kesalahan saat memproses. Coba lagi." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
