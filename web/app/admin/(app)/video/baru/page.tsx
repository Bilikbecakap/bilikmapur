import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireSessionAction } from "@/lib/permissions";
import { withActivityLog } from "@/lib/activityLog";

export const metadata: Metadata = { title: "Tambah Video" };

async function createVideo(formData: FormData) {
  "use server";
  const session = await requireSessionAction();
  const judul = (formData.get("judul") as string).trim();
  const youtubeId = (formData.get("youtube_id") as string).trim();
  if (!judul || !youtubeId) return;

  await withActivityLog(session, { aksi: "tambah", tipeKonten: "video" }, async (client) => {
    const { rows } = await client.query(
      "INSERT INTO video (judul, deskripsi, youtube_id, status) VALUES ($1,$2,$3,$4) RETURNING id, judul",
      [judul, (formData.get("deskripsi") as string).trim() || null, youtubeId, formData.get("status")]
    );
    return { ringkasan: `Video "${rows[0].judul}"`, targetId: rows[0].id };
  });
  redirect("/admin/video");
}

export default function TambahVideoPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold text-arang mb-8">Tambah Video</h1>
      <form action={createVideo} className="space-y-5 bg-white rounded-xl border border-granit/25 p-6">
        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Judul *</label>
          <input name="judul" required className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
        </div>
        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">YouTube ID *</label>
          <input name="youtube_id" required placeholder="mis. dQw4w9WgXcQ (bukan URL lengkap)" className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang font-mono focus:outline-none focus:border-arang" />
          <p className="text-[11px] text-teks-sekunder mt-1">Ambil dari URL YouTube: youtube.com/watch?v=<strong>ID_INI</strong></p>
        </div>
        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Deskripsi</label>
          <textarea name="deskripsi" rows={3} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang resize-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Status</label>
          <select name="status" className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang">
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
