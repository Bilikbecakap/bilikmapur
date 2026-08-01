import type { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction, requireAdminPage } from "@/lib/permissions";
import { withActivityLog, type TipeKonten } from "@/lib/activityLog";
import DeleteButton from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Sampah" };
export const dynamic = "force-dynamic";

const TABEL: Record<TipeKonten, { tabel: string; kolomJudul: string; label: string }> = {
  entry: { tabel: "entries", kolomJudul: "lema", label: "Lema" },
  artikel: { tabel: "artikel", kolomJudul: "judul", label: "Artikel" },
  video: { tabel: "video", kolomJudul: "judul", label: "Video" },
  modul: { tabel: "modul", kolomJudul: "judul", label: "Modul" },
  kategori: { tabel: "kategori", kolomJudul: "nama", label: "Kategori" },
};

function ambilTabel(tipe: string): { tabel: string; kolomJudul: string; label: string } {
  if (!(tipe in TABEL)) throw new Error("Tipe konten tidak dikenal.");
  return TABEL[tipe as TipeKonten];
}

async function restoreItem(formData: FormData) {
  "use server";
  const session = await requireAdminAction();
  const id = formData.get("id") as string;
  const tipe = formData.get("tipe_konten") as string;
  const { tabel, kolomJudul, label } = ambilTabel(tipe);

  await withActivityLog(session, { aksi: "pulihkan", tipeKonten: tipe as TipeKonten, targetId: id }, async (client) => {
    const { rows } = await client.query(
      `UPDATE ${tabel} SET dihapus_pada = NULL, dihapus_oleh = NULL
       WHERE id = $1 AND dihapus_pada IS NOT NULL RETURNING ${kolomJudul}`,
      [tipe === "kategori" ? Number(id) : id]
    );
    return rows[0] ? { ringkasan: `${label} "${rows[0][kolomJudul]}"` } : null;
  });
  revalidatePath("/admin/sampah");
}

async function permanentlyDeleteItem(formData: FormData) {
  "use server";
  const session = await requireAdminAction();
  const id = formData.get("id") as string;
  const tipe = formData.get("tipe_konten") as string;
  const { tabel, kolomJudul, label } = ambilTabel(tipe);

  try {
    await withActivityLog(session, { aksi: "hapus_permanen", tipeKonten: tipe as TipeKonten, targetId: id }, async (client) => {
      const { rows } = await client.query(
        `DELETE FROM ${tabel} WHERE id = $1 AND dihapus_pada IS NOT NULL RETURNING ${kolomJudul}`,
        [tipe === "kategori" ? Number(id) : id]
      );
      return rows[0] ? { ringkasan: `${label} "${rows[0][kolomJudul]}"` } : null;
    });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "23503") {
      redirect("/admin/sampah?galat=Tidak+bisa+dihapus+permanen%2C+masih+direferensikan+data+lain.");
    }
    throw err;
  }
  revalidatePath("/admin/sampah");
}

export default async function SampahPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdminPage();
  const sp = await searchParams;
  const galat = sp.galat;
  const hal = Math.max(1, parseInt(sp.hal ?? "1", 10));
  const PER = 30;
  const offset = (hal - 1) * PER;

  const { rows } = await pool.query(
    `WITH sampah AS (
       SELECT 'entry' AS tipe_konten, e.id::text AS id, e.lema AS judul, e.dihapus_pada, u.email AS dihapus_oleh
       FROM entries e LEFT JOIN users u ON u.id = e.dihapus_oleh WHERE e.dihapus_pada IS NOT NULL
       UNION ALL
       SELECT 'artikel', a.id::text, a.judul, a.dihapus_pada, u.email
       FROM artikel a LEFT JOIN users u ON u.id = a.dihapus_oleh WHERE a.dihapus_pada IS NOT NULL
       UNION ALL
       SELECT 'video', v.id::text, v.judul, v.dihapus_pada, u.email
       FROM video v LEFT JOIN users u ON u.id = v.dihapus_oleh WHERE v.dihapus_pada IS NOT NULL
       UNION ALL
       SELECT 'modul', m.id::text, m.judul, m.dihapus_pada, u.email
       FROM modul m LEFT JOIN users u ON u.id = m.dihapus_oleh WHERE m.dihapus_pada IS NOT NULL
       UNION ALL
       SELECT 'kategori', k.id::text, k.nama, k.dihapus_pada, u.email
       FROM kategori k LEFT JOIN users u ON u.id = k.dihapus_oleh WHERE k.dihapus_pada IS NOT NULL
     )
     SELECT *, COUNT(*) OVER() AS total,
            to_char(dihapus_pada, 'DD Mon YYYY HH24:MI') AS dihapus_pada_fmt
     FROM sampah
     ORDER BY dihapus_pada DESC
     LIMIT $1 OFFSET $2`,
    [PER, offset]
  );

  const total = parseInt(rows[0]?.total ?? "0", 10);
  const totalHal = Math.ceil(total / PER);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-arang mb-1">Sampah</h1>
        <p className="text-sm text-teks-sekunder">
          {total === 0 ? "Tidak ada konten yang dihapus." : `${total} item dihapus, bisa dipulihkan atau dihapus permanen.`}
        </p>
      </div>

      {galat && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-beras-merah/10 text-beras-merah text-sm">{galat}</div>
      )}

      <div className="rounded-xl border border-granit/25 overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-kapur/50 border-b border-granit/20">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide">Tipe</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide">Judul / Nama</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide hidden sm:table-cell">Dihapus pada</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide hidden md:table-cell">Dihapus oleh</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-sm text-teks-sekunder">Sampah kosong.</td></tr>
            ) : rows.map((r, i) => (
              <tr key={`${r.tipe_konten}-${r.id}`} className={i !== 0 ? "border-t border-granit/15" : ""}>
                <td className="px-4 py-3">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-granit/20 text-teks-sekunder">
                    {TABEL[r.tipe_konten as TipeKonten].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-arang font-medium">{r.judul}</td>
                <td className="px-4 py-3 text-teks-sekunder text-xs hidden sm:table-cell">{r.dihapus_pada_fmt}</td>
                <td className="px-4 py-3 text-teks-sekunder text-xs hidden md:table-cell">{r.dihapus_oleh ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <form action={restoreItem}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="tipe_konten" value={r.tipe_konten} />
                      <button type="submit" className="text-xs text-rimba hover:text-rimba/80 transition-colors">Pulihkan</button>
                    </form>
                    <DeleteButton
                      formAction={permanentlyDeleteItem}
                      hiddenFields={{ id: r.id, tipe_konten: r.tipe_konten }}
                      label="Hapus Permanen"
                      confirmMessage={`Hapus permanen "${r.judul}"? Tindakan ini TIDAK BISA dibatalkan.`}
                    />
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
            {hal > 1 && <Link href={`?hal=${hal - 1}`} className="px-3 py-1.5 border border-black/15 rounded-lg text-xs text-teks-sekunder hover:border-arang hover:text-arang transition-colors">← Sebelumnya</Link>}
            {hal < totalHal && <Link href={`?hal=${hal + 1}`} className="px-3 py-1.5 border border-black/15 rounded-lg text-xs text-teks-sekunder hover:border-arang hover:text-arang transition-colors">Berikutnya →</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
