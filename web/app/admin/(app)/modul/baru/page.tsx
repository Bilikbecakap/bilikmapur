import type { Metadata } from "next";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import FileUploader from "@/components/admin/FileUploader";

export const metadata: Metadata = { title: "Upload Modul" };

async function createModul(formData: FormData) {
  "use server";
  const judul = (formData.get("judul") as string).trim();
  const slug = (formData.get("slug") as string).trim();
  const filePdf = (formData.get("file_pdf") as string).trim();
  if (!judul || !slug || !filePdf) return;

  await pool.query(
    `INSERT INTO modul (judul, slug, deskripsi, file_pdf, gambar_sampul, jumlah_halaman, kategori, warna_penanda, urutan, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      judul, slug,
      (formData.get("deskripsi") as string).trim() || null,
      filePdf,
      (formData.get("gambar_sampul") as string).trim() || null,
      parseInt(formData.get("jumlah_halaman") as string, 10) || null,
      (formData.get("kategori") as string).trim() || null,
      (formData.get("warna_penanda") as string) || null,
      parseInt(formData.get("urutan") as string, 10) || 0,
      formData.get("status") as string,
    ]
  );
  redirect("/admin/modul");
}

export default function UploadModulPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold text-arang mb-8">Upload Modul PDF</h1>

      <form action={createModul} className="space-y-5 bg-white rounded-xl border border-granit/25 p-6">
        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Judul *</label>
          <input name="judul" required className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
        </div>
        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Slug URL *</label>
          <input name="slug" required placeholder="mis. belajar-bahasa-mapur-1" className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
        </div>
        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Deskripsi</label>
          <textarea name="deskripsi" rows={2} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang resize-none" />
        </div>

        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">File PDF *</label>
          <FileUploader name="file_pdf" subfolder="pdf" accept=".pdf,application/pdf" />
        </div>

        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Gambar sampul (opsional)</label>
          <FileUploader name="gambar_sampul" subfolder="gambar" accept="image/*" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Jumlah halaman</label>
            <input name="jumlah_halaman" type="number" min="1" className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
          </div>
          <div>
            <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Urutan tampil</label>
            <input name="urutan" type="number" defaultValue="0" className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Kategori modul</label>
          <input name="kategori" placeholder="mis. Bahan Ajar, Cerita Rakyat" className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Warna penanda</label>
            <select name="warna_penanda" className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang">
              <option value="">— Tidak ada —</option>
              <option value="beras-merah">Beras Merah</option>
              <option value="rimba">Rimba</option>
              <option value="kulit-kayu">Kulit Kayu</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Status</label>
            <select name="status" className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang">
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
