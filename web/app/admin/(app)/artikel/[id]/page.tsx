import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import pool from "@/lib/db";
import FileUploader from "@/components/admin/FileUploader";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { requireSessionAction } from "@/lib/permissions";
import { withActivityLog } from "@/lib/activityLog";

export const metadata: Metadata = { title: "Edit Artikel" };

async function updateArtikel(formData: FormData) {
  "use server";
  const session = await requireSessionAction();
  const id = formData.get("id") as string;
  await withActivityLog(session, { aksi: "edit", tipeKonten: "artikel", targetId: id }, async (client) => {
    const { rows } = await client.query(
      `UPDATE artikel SET judul=$1, slug=$2, ringkasan=$3, konten=$4, penulis=$5,
        gambar_sampul=$6, status=$7, diperbarui_pada=now() WHERE id=$8 AND dihapus_pada IS NULL RETURNING judul`,
      [
        (formData.get("judul") as string).trim(),
        (formData.get("slug") as string).trim(),
        (formData.get("ringkasan") as string).trim() || null,
        (formData.get("konten") as string).trim() || null,
        (formData.get("penulis") as string).trim() || null,
        (formData.get("gambar_sampul") as string).trim() || null,
        formData.get("status") as string,
        id,
      ]
    );
    return rows[0] ? { ringkasan: `Artikel "${rows[0].judul}"` } : null;
  });
  redirect("/admin/artikel");
}

export default async function EditArtikelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { rows } = await pool.query("SELECT * FROM artikel WHERE id = $1 AND dihapus_pada IS NULL", [id]);
  if (!rows[0]) notFound();
  const a = rows[0];

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold text-arang mb-8">Edit Artikel</h1>

      <form action={updateArtikel} className="space-y-5 bg-white rounded-xl border border-granit/25 p-6">
        <input type="hidden" name="id" value={id} />
        <F label="Judul *" name="judul" defaultValue={a.judul} required />
        <F label="Slug URL *" name="slug" defaultValue={a.slug} required />
        <F label="Penulis" name="penulis" defaultValue={a.penulis ?? ""} />
        <FA label="Ringkasan" name="ringkasan" defaultValue={a.ringkasan ?? ""} rows={2} />

        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Konten artikel</label>
          <RichTextEditor name="konten" defaultValue={a.konten ?? ""} />
        </div>

        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Gambar sampul</label>
          <FileUploader name="gambar_sampul" currentKey={a.gambar_sampul ?? ""} subfolder="gambar" accept="image/*" />
        </div>

        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Status</label>
          <select name="status" defaultValue={a.status} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-5 py-2.5 rounded-lg bg-beras-merah text-kapur text-sm font-medium hover:opacity-90">Simpan</button>
          <a href="/admin/artikel" className="px-5 py-2.5 rounded-lg border border-granit/40 text-teks-sekunder text-sm hover:border-arang hover:text-arang transition-colors">Batal</a>
        </div>
      </form>
    </div>
  );
}

function F({ label, name, defaultValue, required }: { label: string; name: string; defaultValue?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-teks-sekunder mb-1.5">{label}</label>
      <input name={name} defaultValue={defaultValue} required={required} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
    </div>
  );
}

function FA({ label, name, defaultValue, rows = 3 }: { label: string; name: string; defaultValue?: string; rows?: number }) {
  return (
    <div>
      <label className="block text-xs font-medium text-teks-sekunder mb-1.5">{label}</label>
      <textarea name={name} defaultValue={defaultValue} rows={rows} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang resize-none" />
    </div>
  );
}
