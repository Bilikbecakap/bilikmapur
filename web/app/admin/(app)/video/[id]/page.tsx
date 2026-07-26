import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import pool from "@/lib/db";

export const metadata: Metadata = { title: "Edit Video" };

async function updateVideo(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await pool.query(
    "UPDATE video SET judul=$1, youtube_id=$2, deskripsi=$3, status=$4 WHERE id=$5",
    [
      (formData.get("judul") as string).trim(),
      (formData.get("youtube_id") as string).trim(),
      (formData.get("deskripsi") as string).trim() || null,
      formData.get("status"),
      id,
    ]
  );
  redirect("/admin/video");
}

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { rows } = await pool.query("SELECT * FROM video WHERE id = $1", [id]);
  if (!rows[0]) notFound();
  const v = rows[0];

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold text-arang mb-8">Edit Video</h1>
      <form action={updateVideo} className="space-y-5 bg-white rounded-xl border border-granit/25 p-6">
        <input type="hidden" name="id" value={id} />
        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Judul *</label>
          <input name="judul" defaultValue={v.judul} required className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
        </div>
        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">YouTube ID *</label>
          <input name="youtube_id" defaultValue={v.youtube_id} required className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang font-mono focus:outline-none focus:border-arang" />
        </div>
        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Deskripsi</label>
          <textarea name="deskripsi" defaultValue={v.deskripsi ?? ""} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang resize-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Status</label>
          <select name="status" defaultValue={v.status} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-5 py-2.5 rounded-lg bg-beras-merah text-kapur text-sm font-medium hover:opacity-90">Simpan</button>
          <a href="/admin/video" className="px-5 py-2.5 rounded-lg border border-granit/40 text-teks-sekunder text-sm hover:border-arang hover:text-arang transition-colors">Batal</a>
        </div>
      </form>
    </div>
  );
}
