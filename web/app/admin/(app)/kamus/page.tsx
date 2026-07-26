import type { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Kamus" };
export const dynamic = "force-dynamic";

async function deleteEntry(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await pool.query("DELETE FROM entries WHERE id = $1", [id]);
  revalidatePath("/admin/kamus");
}

export default async function AdminKamusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const hal = Math.max(1, parseInt(sp.hal ?? "1", 10));
  const PER = 30;
  const offset = (hal - 1) * PER;

  const params: (string | number)[] = [];
  const conditions: string[] = [];

  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(e.lema ILIKE $${params.length} OR e.arti_indonesia ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  params.push(PER, offset);
  const limitIdx = params.length - 1;
  const offsetIdx = params.length;

  const { rows } = await pool.query(
    `SELECT e.id, e.lema, e.arti_indonesia, e.status, k.nama AS kategori,
            COUNT(*) OVER() AS total
     FROM entries e
     LEFT JOIN kategori k ON k.id = e.kategori_id
     ${where}
     ORDER BY e.lema ASC
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params
  );

  const total = parseInt(rows[0]?.total ?? "0", 10);
  const totalHal = Math.ceil(total / PER);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-arang">Kamus</h1>
          <p className="text-sm text-teks-sekunder mt-0.5">{total.toLocaleString("id-ID")} lema</p>
        </div>
        <Link href="/admin/kamus/baru" className="px-4 py-2 rounded-lg bg-beras-merah text-kapur text-sm font-medium hover:opacity-90 transition-opacity">
          + Tambah Lema
        </Link>
      </div>

      <form method="get" className="mb-5">
        <input name="q" defaultValue={q} placeholder="Cari lema atau arti…"
          className="w-full max-w-sm px-4 py-2.5 rounded-lg border border-black/15 bg-white text-sm text-arang focus:outline-none focus:border-arang" />
      </form>

      <div className="rounded-xl border border-black/8 overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#F4F5F7] border-b border-black/8">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide">Lema</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide hidden sm:table-cell">Arti</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide hidden lg:table-cell">Kategori</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-sm text-teks-sekunder">
                {q ? `Tidak ada hasil untuk "${q}".` : "Belum ada lema."}
              </td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="hover:bg-[#F4F5F7]/50 transition-colors">
                <td className="px-4 py-3 font-medium text-kulit-kayu italic">{r.lema}</td>
                <td className="px-4 py-3 text-teks-sekunder hidden sm:table-cell truncate max-w-xs">{r.arti_indonesia}</td>
                <td className="px-4 py-3 text-teks-sekunder hidden lg:table-cell text-xs">{r.kategori ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${r.status === "published" ? "bg-rimba/12 text-rimba" : "bg-black/8 text-teks-sekunder"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/kamus/${r.id}`} className="text-xs text-teks-sekunder hover:text-arang transition-colors">Edit</Link>
                    <DeleteButton formAction={deleteEntry} hiddenFields={{ id: r.id }} confirmMessage={`Hapus lema "${r.lema}"?`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalHal > 1 && (
        <div className="flex items-center justify-between mt-5">
          <span className="text-xs text-teks-sekunder">Hal. {hal} / {totalHal}</span>
          <div className="flex gap-2">
            {hal > 1 && <Link href={`?${q ? `q=${encodeURIComponent(q)}&` : ""}hal=${hal - 1}`} className="px-3 py-1.5 border border-black/15 rounded-lg text-xs text-teks-sekunder hover:border-arang hover:text-arang transition-colors">← Sebelumnya</Link>}
            {hal < totalHal && <Link href={`?${q ? `q=${encodeURIComponent(q)}&` : ""}hal=${hal + 1}`} className="px-3 py-1.5 border border-black/15 rounded-lg text-xs text-teks-sekunder hover:border-arang hover:text-arang transition-colors">Berikutnya →</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
