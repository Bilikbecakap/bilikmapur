import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import pool from "@/lib/db";
import FileUploader from "@/components/admin/FileUploader";

export const metadata: Metadata = { title: "Edit Modul" };

async function updateModul(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await pool.query(
    `UPDATE modul SET judul=$1, slug=$2, deskripsi=$3, file_pdf=$4, gambar_sampul=$5,
      jumlah_halaman=$6, kategori=$7, warna_penanda=$8, urutan=$9, status=$10, diperbarui_pada=now()
     WHERE id=$11`,
    [
      (formData.get("judul") as string).trim(),
      (formData.get("slug") as string).trim(),
      (formData.get("deskripsi") as string).trim() || null,
      (formData.get("file_pdf") as string).trim(),
      (formData.get("gambar_sampul") as string).trim() || null,
      parseInt(formData.get("jumlah_halaman") as string, 10) || null,
      (formData.get("kategori") as string).trim() || null,
      (formData.get("warna_penanda") as string) || null,
      parseInt(formData.get("urutan") as string, 10) || 0,
      formData.get("status") as string,
      id,
    ]
  );
  redirect("/admin/modul");
}

export default async function EditModulPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { rows } = await pool.query("SELECT * FROM modul WHERE id = $1", [id]);
  if (!rows[0]) notFound();
  const m = rows[0];

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold text-arang mb-8">Edit Modul</h1>

      <form action={updateModul} className="space-y-5 bg-white rounded-xl border border-granit/25 p-6">
        <input type="hidden" name="id" value={id} />

        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Judul *</label>
          <input name="judul" defaultValue={m.judul} required className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
        </div>
        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Slug URL *</label>
          <input name="slug" defaultValue={m.slug} required className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
        </div>
        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Deskripsi</label>
          <textarea name="deskripsi" defaultValue={m.deskripsi ?? ""} rows={2} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang resize-none" />
        </div>

        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">File PDF *</label>
          <FileUploader name="file_pdf" currentKey={m.file_pdf} subfolder="pdf" accept=".pdf,application/pdf" />
        </div>

        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Gambar sampul</label>
          <FileUploader name="gambar_sampul" currentKey={m.gambar_sampul ?? ""} subfolder="gambar" accept="image/*" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Jumlah halaman</label>
            <input name="jumlah_halaman" type="number" defaultValue={m.jumlah_halaman ?? ""} min="1" className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
          </div>
          <div>
            <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Urutan tampil</label>
            <input name="urutan" type="number" defaultValue={m.urutan} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Kategori modul</label>
          <input name="kategori" defaultValue={m.kategori ?? ""} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Warna penanda</label>
            <select name="warna_penanda" defaultValue={m.warna_penanda ?? ""} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang">
              <option value="">— Tidak ada —</option>
              <option value="beras-merah">Beras Merah</option>
              <option value="rimba">Rimba</option>
              <option value="kulit-kayu">Kulit Kayu</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Status</label>
            <select name="status" defaultValue={m.status} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-5 py-2.5 rounded-lg bg-beras-merah text-kapur text-sm font-medium hover:opacity-90">Simpan</button>
          <a href="/admin/modul" className="px-5 py-2.5 rounded-lg border border-granit/40 text-teks-sekunder text-sm hover:border-arang hover:text-arang transition-colors">Batal</a>
        </div>
      </form>
    </div>
  );
}
