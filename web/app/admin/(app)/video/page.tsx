import type { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Video" };
export const dynamic = "force-dynamic";

async function deleteVideo(formData: FormData) {
  "use server";
  await pool.query("DELETE FROM video WHERE id = $1", [formData.get("id")]);
  revalidatePath("/admin/video");
}

export default async function AdminVideoPage() {
  const { rows } = await pool.query(
    "SELECT id, judul, youtube_id, status, to_char(dibuat_pada,'DD Mon YYYY') AS tgl FROM video ORDER BY dibuat_pada DESC"
  );

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-arang">Video</h1>
        <Link href="/admin/video/baru" className="px-4 py-2 rounded-lg bg-beras-merah text-kapur text-sm font-medium hover:opacity-90">
          + Tambah Video
        </Link>
      </div>

      <div className="rounded-xl border border-granit/25 overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-kapur/50 border-b border-granit/20">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide">Judul</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide hidden sm:table-cell">YouTube ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide hidden md:table-cell">Tanggal</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={i !== 0 ? "border-t border-granit/15" : ""}>
                <td className="px-4 py-3 font-medium text-arang">{r.judul}</td>
                <td className="px-4 py-3 text-teks-sekunder font-mono text-xs hidden sm:table-cell">{r.youtube_id}</td>
                <td className="px-4 py-3 text-teks-sekunder text-xs hidden md:table-cell">{r.tgl}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${r.status === "published" ? "bg-rimba/15 text-rimba" : "bg-granit/20 text-teks-sekunder"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/video/${r.id}`} className="text-xs text-teks-sekunder hover:text-arang transition-colors">Edit</Link>
                    <DeleteButton
                      formAction={deleteVideo}
                      hiddenFields={{ id: r.id }}
                      confirmMessage={`Hapus video "${r.judul}"?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="py-12 text-center text-teks-sekunder text-sm">Belum ada video.</div>}
      </div>
    </div>
  );
}
