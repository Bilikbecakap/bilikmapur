import type { Metadata } from "next";
import { redirect } from "next/navigation";
import pool from "@/lib/db";

export const metadata: Metadata = { title: "Tambah Lema" };

async function createEntry(formData: FormData) {
  "use server";
  const lema = (formData.get("lema") as string).trim();
  const arti = (formData.get("arti_indonesia") as string).trim();
  const kategoriId = formData.get("kategori_id") as string | null;
  if (!lema || !arti) return;

  await pool.query(
    `INSERT INTO entries (lema, kategori_id, arti_indonesia, contoh_kalimat_mapur, contoh_kalimat_indonesia, pelafalan_ipa, catatan, sumber, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      lema,
      kategoriId || null,
      arti,
      (formData.get("contoh_kalimat_mapur") as string).trim() || null,
      (formData.get("contoh_kalimat_indonesia") as string).trim() || null,
      (formData.get("pelafalan_ipa") as string).trim() || null,
      (formData.get("catatan") as string).trim() || null,
      (formData.get("sumber") as string).trim() || null,
      formData.get("status") as string || "published",
    ]
  );
  redirect("/admin/kamus");
}

export default async function TambahLemaPage() {
  const { rows: kategoriList } = await pool.query("SELECT id, nama FROM kategori ORDER BY urutan, nama");

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold text-arang mb-8">Tambah Lema Baru</h1>

      <form action={createEntry} className="space-y-5 bg-white rounded-xl border border-granit/25 p-6">
        <Field label="Lema (kata Mapur)" name="lema" required placeholder="mis. cingkok" />
        <Field label="Arti dalam Bahasa Indonesia" name="arti_indonesia" required placeholder="mis. berlari cepat" />

        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Kategori</label>
          <select name="kategori_id" className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang">
            <option value="">— Pilih kategori —</option>
            {kategoriList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        </div>

        <Field label="Pelafalan IPA (opsional)" name="pelafalan_ipa" placeholder="mis. /tʃiŋkok/" />
        <FieldArea label="Contoh kalimat (Mapur)" name="contoh_kalimat_mapur" />
        <FieldArea label="Contoh kalimat (Indonesia)" name="contoh_kalimat_indonesia" />
        <FieldArea label="Catatan pemakaian / budaya" name="catatan" />
        <Field label="Sumber / atribusi penutur" name="sumber" placeholder="mis. Pak Ahmad, Belinyu, 2024" />

        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Status</label>
          <select name="status" className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-5 py-2.5 rounded-lg bg-beras-merah text-kapur text-sm font-medium hover:opacity-90 transition-opacity">
            Simpan
          </button>
          <a href="/admin/kamus" className="px-5 py-2.5 rounded-lg border border-granit/40 text-teks-sekunder text-sm hover:border-arang hover:text-arang transition-colors">
            Batal
          </a>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, required, placeholder }: { label: string; name: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-teks-sekunder mb-1.5">{label}{required && " *"}</label>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang placeholder-granit/50 focus:outline-none focus:border-arang"
      />
    </div>
  );
}

function FieldArea({ label, name }: { label: string; name: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-teks-sekunder mb-1.5">{label}</label>
      <textarea
        name={name}
        rows={2}
        className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang resize-none"
      />
    </div>
  );
}
