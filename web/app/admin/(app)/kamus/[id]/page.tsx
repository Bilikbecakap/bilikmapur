import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import pool from "@/lib/db";
import FileUploader from "@/components/admin/FileUploader";

export const metadata: Metadata = { title: "Edit Lema" };

async function updateEntry(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await pool.query(
    `UPDATE entries SET
      lema=$1, kategori_id=$2, arti_indonesia=$3,
      contoh_kalimat_mapur=$4, contoh_kalimat_indonesia=$5,
      pelafalan_ipa=$6, audio=$7, catatan=$8, sumber=$9,
      status=$10, diperbarui_pada=now()
     WHERE id=$11`,
    [
      (formData.get("lema") as string).trim(),
      (formData.get("kategori_id") as string) || null,
      (formData.get("arti_indonesia") as string).trim(),
      (formData.get("contoh_kalimat_mapur") as string).trim() || null,
      (formData.get("contoh_kalimat_indonesia") as string).trim() || null,
      (formData.get("pelafalan_ipa") as string).trim() || null,
      (formData.get("audio") as string).trim() || null,
      (formData.get("catatan") as string).trim() || null,
      (formData.get("sumber") as string).trim() || null,
      formData.get("status") as string,
      id,
    ]
  );
  redirect("/admin/kamus");
}

export default async function EditLemaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ rows }, { rows: kategoriList }] = await Promise.all([
    pool.query(
      `SELECT e.*, k.nama AS kategori_nama FROM entries e LEFT JOIN kategori k ON k.id = e.kategori_id WHERE e.id = $1`,
      [id]
    ),
    pool.query("SELECT id, nama FROM kategori ORDER BY urutan, nama"),
  ]);

  if (!rows[0]) notFound();
  const e = rows[0];

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold text-arang mb-8">
        Edit: <em className="text-kulit-kayu">{e.lema}</em>
      </h1>

      <form action={updateEntry} className="space-y-5 bg-white rounded-xl border border-granit/25 p-6">
        <input type="hidden" name="id" value={id} />

        <F label="Lema *" name="lema" defaultValue={e.lema} required />
        <F label="Arti dalam Bahasa Indonesia *" name="arti_indonesia" defaultValue={e.arti_indonesia} required />

        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Kategori</label>
          <select name="kategori_id" defaultValue={e.kategori_id ?? ""} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang">
            <option value="">— Pilih kategori —</option>
            {kategoriList.map((k: { id: number; nama: string }) => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        </div>

        <F label="Pelafalan IPA" name="pelafalan_ipa" defaultValue={e.pelafalan_ipa ?? ""} />
        <FA label="Contoh kalimat (Mapur)" name="contoh_kalimat_mapur" defaultValue={e.contoh_kalimat_mapur ?? ""} />
        <FA label="Contoh kalimat (Indonesia)" name="contoh_kalimat_indonesia" defaultValue={e.contoh_kalimat_indonesia ?? ""} />
        <FA label="Catatan pemakaian / budaya" name="catatan" defaultValue={e.catatan ?? ""} />
        <F label="Sumber / atribusi penutur" name="sumber" defaultValue={e.sumber ?? ""} />

        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Audio pelafalan</label>
          <FileUploader name="audio" currentKey={e.audio ?? ""} subfolder="audio" accept="audio/*" />
        </div>

        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Status</label>
          <select name="status" defaultValue={e.status} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang">
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

function F({ label, name, defaultValue, required }: { label: string; name: string; defaultValue?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-teks-sekunder mb-1.5">{label}</label>
      <input name={name} defaultValue={defaultValue} required={required} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
    </div>
  );
}

function FA({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-teks-sekunder mb-1.5">{label}</label>
      <textarea name={name} defaultValue={defaultValue} rows={2} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang resize-none" />
    </div>
  );
}
