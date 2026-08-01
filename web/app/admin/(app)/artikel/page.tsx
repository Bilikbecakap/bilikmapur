import type { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/admin/DeleteButton";
import { requireSessionAction } from "@/lib/permissions";
import { withActivityLog } from "@/lib/activityLog";

export const metadata: Metadata = { title: "Artikel" };
export const dynamic = "force-dynamic";

async function deleteArtikel(formData: FormData) {
  "use server";
  const session = await requireSessionAction();
  const id = formData.get("id") as string;
  await withActivityLog(session, { aksi: "hapus", tipeKonten: "artikel", targetId: id }, async (client) => {
    const { rows } = await client.query(
      `UPDATE artikel SET dihapus_pada = now(), dihapus_oleh = $2
       WHERE id = $1 AND dihapus_pada IS NULL RETURNING judul`,
      [id, Number(session.sub)]
    );
    return rows[0] ? { ringkasan: `Artikel "${rows[0].judul}"` } : null;
  });
  revalidatePath("/admin/artikel");
}

export default async function AdminArtikelPage() {
  const { rows } = await pool.query(
    `SELECT id, judul, slug, penulis, status,
            to_char(dibuat_pada,'DD Mon YYYY') AS tgl
     FROM artikel WHERE dihapus_pada IS NULL ORDER BY dibuat_pada DESC`
  );

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-arang">Artikel</h1>
        <Link href="/admin/artikel/baru" className="px-4 py-2 rounded-lg bg-beras-merah text-kapur text-sm font-medium hover:opacity-90">
          + Tulis Artikel
        </Link>
      </div>

      <div className="rounded-xl border border-granit/25 overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-kapur/50 border-b border-granit/20">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide">Judul</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide hidden sm:table-cell">Penulis</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide hidden md:table-cell">Tanggal</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={i !== 0 ? "border-t border-granit/15" : ""}>
                <td className="px-4 py-3 font-medium text-arang">{r.judul}</td>
                <td className="px-4 py-3 text-teks-sekunder hidden sm:table-cell">{r.penulis ?? "—"}</td>
                <td className="px-4 py-3 text-teks-sekunder hidden md:table-cell text-xs">{r.tgl}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${r.status === "published" ? "bg-rimba/15 text-rimba" : "bg-granit/20 text-teks-sekunder"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/artikel/${r.id}`} className="text-xs text-teks-sekunder hover:text-arang transition-colors">Edit</Link>
                    <DeleteButton
                      formAction={deleteArtikel}
                      hiddenFields={{ id: r.id }}
                      confirmMessage={`Hapus artikel "${r.judul}"?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="py-12 text-center text-teks-sekunder text-sm">Belum ada artikel.</div>}
      </div>
    </div>
  );
}
