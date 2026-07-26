import type { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Modul" };
export const dynamic = "force-dynamic";

async function deleteModul(formData: FormData) {
  "use server";
  await pool.query("DELETE FROM modul WHERE id = $1", [formData.get("id")]);
  revalidatePath("/admin/modul");
}

export default async function AdminModulPage() {
  const { rows } = await pool.query(
    "SELECT id, judul, slug, kategori, jumlah_halaman, status, urutan FROM modul ORDER BY urutan ASC, dibuat_pada DESC"
  );

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-arang">Modul PDF</h1>
        <Link href="/admin/modul/baru" className="px-4 py-2 rounded-lg bg-beras-merah text-kapur text-sm font-medium hover:opacity-90">
          + Upload Modul
        </Link>
      </div>

      <div className="rounded-xl border border-granit/25 overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-kapur/50 border-b border-granit/20">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide">Judul</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide hidden sm:table-cell">Kategori</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide hidden md:table-cell">Hlm</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={i !== 0 ? "border-t border-granit/15" : ""}>
                <td className="px-4 py-3 font-medium text-arang">{r.judul}</td>
                <td className="px-4 py-3 text-teks-sekunder hidden sm:table-cell">{r.kategori ?? "—"}</td>
                <td className="px-4 py-3 text-teks-sekunder hidden md:table-cell">{r.jumlah_halaman ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${r.status === "published" ? "bg-rimba/15 text-rimba" : "bg-granit/20 text-teks-sekunder"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/modul/${r.id}`} className="text-xs text-teks-sekunder hover:text-arang transition-colors">Edit</Link>
                    <DeleteButton
                      formAction={deleteModul}
                      hiddenFields={{ id: r.id }}
                      confirmMessage={`Hapus modul "${r.judul}"?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="py-12 text-center text-teks-sekunder text-sm">Belum ada modul.</div>}
      </div>
    </div>
  );
}
