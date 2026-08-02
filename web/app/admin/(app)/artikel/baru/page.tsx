import type { Metadata } from "next";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import FileUploader from "@/components/admin/FileUploader";
import RichTextEditor from "@/components/admin/RichTextEditor";
import JudulSlugFields from "@/components/admin/JudulSlugFields";
import { requireSessionAction } from "@/lib/permissions";
import { withActivityLog } from "@/lib/activityLog";
import { KATEGORI_ARTIKEL } from "@/lib/artikelKategori";

export const metadata: Metadata = { title: "Tulis Artikel" };

async function createArtikel(formData: FormData) {
  "use server";
  const session = await requireSessionAction();
  const judul = (formData.get("judul") as string).trim();
  const slug = (formData.get("slug") as string).trim();
  if (!judul || !slug) return;

  await withActivityLog(session, { aksi: "tambah", tipeKonten: "artikel" }, async (client) => {
    const { rows } = await client.query(
      `INSERT INTO artikel (judul, slug, ringkasan, konten, penulis, gambar_sampul, kategori, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, judul`,
      [
        judul, slug,
        (formData.get("ringkasan") as string).trim() || null,
        (formData.get("konten") as string).trim() || null,
        (formData.get("penulis") as string).trim() || null,
        (formData.get("gambar_sampul") as string).trim() || null,
        (formData.get("kategori") as string) || null,
        formData.get("status") as string,
      ]
    );
    return { ringkasan: `Artikel "${rows[0].judul}"`, targetId: rows[0].id };
  });
  redirect("/admin/artikel");
}

export default function TulisArtikelPage() {
  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold text-arang mb-8">Tulis Artikel</h1>

      <form action={createArtikel} className="space-y-5 bg-white rounded-xl border border-granit/25 p-6">
        <JudulSlugFields />
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Penulis" name="penulis" />
          <div>
            <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Kategori</label>
            <select name="kategori" className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang">
              <option value="">— Tanpa kategori —</option>
              {KATEGORI_ARTIKEL.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>
        <FA label="Ringkasan (ditampilkan di halaman daftar)" name="ringkasan" rows={2} />

        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Konten artikel</label>
          <RichTextEditor name="konten" />
        </div>

        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Gambar sampul</label>
          <FileUploader name="gambar_sampul" subfolder="gambar" accept="image/*" />
        </div>

        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Status</label>
          <select name="status" className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang">
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

function F({ label, name, required, placeholder }: { label: string; name: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-teks-sekunder mb-1.5">{label}</label>
      <input name={name} required={required} placeholder={placeholder} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
    </div>
  );
}

function FA({ label, name, rows = 3 }: { label: string; name: string; rows?: number }) {
  return (
    <div>
      <label className="block text-xs font-medium text-teks-sekunder mb-1.5">{label}</label>
      <textarea name={name} rows={rows} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang resize-none" />
    </div>
  );
}
