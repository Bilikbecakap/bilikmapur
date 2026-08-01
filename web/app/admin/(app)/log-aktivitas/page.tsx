import type { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";
import { requireAdminPage } from "@/lib/permissions";

export const metadata: Metadata = { title: "Log Aktivitas" };
export const dynamic = "force-dynamic";

const LABEL_TIPE: Record<string, string> = {
  entry: "Lema",
  artikel: "Artikel",
  video: "Video",
  modul: "Modul",
  kategori: "Kategori",
};

const BADGE_AKSI: Record<string, string> = {
  tambah: "bg-rimba/15 text-rimba",
  edit: "bg-kulit-kayu/15 text-kulit-kayu",
  hapus: "bg-beras-merah/15 text-beras-merah",
  pulihkan: "bg-rimba/15 text-rimba",
  hapus_permanen: "bg-beras-merah/25 text-beras-merah",
};

export default async function LogAktivitasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdminPage();
  const sp = await searchParams;
  const tipe = (sp.tipe ?? "").trim();
  const pelaku = (sp.pelaku ?? "").trim();
  const hal = Math.max(1, parseInt(sp.hal ?? "1", 10));
  const PER = 30;
  const offset = (hal - 1) * PER;

  const params: (string | number)[] = [];
  const conditions: string[] = [];

  if (tipe) {
    params.push(tipe);
    conditions.push(`tipe_konten = $${params.length}`);
  }
  if (pelaku) {
    params.push(pelaku);
    conditions.push(`pelaku_email = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  params.push(PER, offset);
  const limitIdx = params.length - 1;
  const offsetIdx = params.length;

  const [{ rows }, { rows: pelakuList }] = await Promise.all([
    pool.query(
      `SELECT id, aksi, tipe_konten, ringkasan, pelaku_email,
              to_char(dibuat_pada, 'DD Mon YYYY HH24:MI') AS waktu,
              COUNT(*) OVER() AS total
       FROM activity_log
       ${where}
       ORDER BY dibuat_pada DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    ),
    pool.query("SELECT DISTINCT pelaku_email FROM activity_log ORDER BY pelaku_email"),
  ]);

  const total = parseInt(rows[0]?.total ?? "0", 10);
  const totalHal = Math.ceil(total / PER);
  const qs = (extra: Record<string, string>) => {
    const params2 = new URLSearchParams({ ...(tipe && { tipe }), ...(pelaku && { pelaku }), ...extra });
    return `?${params2.toString()}`;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-arang mb-1">Log Aktivitas</h1>
        <p className="text-sm text-teks-sekunder">
          {total.toLocaleString("id-ID")} catatan aktivitas admin & editor.
        </p>
      </div>

      <form method="get" className="flex flex-wrap gap-3 mb-5">
        <select name="tipe" defaultValue={tipe} className="px-3 py-2 rounded-lg border border-black/15 bg-white text-sm text-arang focus:outline-none focus:border-arang">
          <option value="">Semua tipe konten</option>
          {Object.entries(LABEL_TIPE).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
        </select>
        <select name="pelaku" defaultValue={pelaku} className="px-3 py-2 rounded-lg border border-black/15 bg-white text-sm text-arang focus:outline-none focus:border-arang">
          <option value="">Semua pelaku</option>
          {pelakuList.map((p) => <option key={p.pelaku_email} value={p.pelaku_email}>{p.pelaku_email}</option>)}
        </select>
        <button type="submit" className="px-4 py-2 rounded-lg border border-black/15 text-sm text-teks-sekunder hover:border-arang hover:text-arang transition-colors">
          Filter
        </button>
        {(tipe || pelaku) && (
          <Link href="/admin/log-aktivitas" className="px-4 py-2 rounded-lg text-sm text-teks-sekunder hover:text-arang transition-colors">
            Reset
          </Link>
        )}
      </form>

      <div className="rounded-xl border border-black/8 overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#F4F5F7] border-b border-black/8">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide">Waktu</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide">Aksi</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide hidden sm:table-cell">Tipe</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide">Ringkasan</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide hidden md:table-cell">Pelaku</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-sm text-teks-sekunder">Belum ada catatan aktivitas.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="hover:bg-[#F4F5F7]/50 transition-colors">
                <td className="px-4 py-3 text-teks-sekunder text-xs whitespace-nowrap">{r.waktu}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${BADGE_AKSI[r.aksi] ?? "bg-granit/20 text-teks-sekunder"}`}>
                    {r.aksi.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-teks-sekunder hidden sm:table-cell text-xs">{LABEL_TIPE[r.tipe_konten] ?? r.tipe_konten}</td>
                <td className="px-4 py-3 text-arang">{r.ringkasan}</td>
                <td className="px-4 py-3 text-teks-sekunder hidden md:table-cell text-xs">{r.pelaku_email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalHal > 1 && (
        <div className="flex items-center justify-between mt-5">
          <span className="text-xs text-teks-sekunder">Hal. {hal} / {totalHal}</span>
          <div className="flex gap-2">
            {hal > 1 && <Link href={qs({ hal: String(hal - 1) })} className="px-3 py-1.5 border border-black/15 rounded-lg text-xs text-teks-sekunder hover:border-arang hover:text-arang transition-colors">← Sebelumnya</Link>}
            {hal < totalHal && <Link href={qs({ hal: String(hal + 1) })} className="px-3 py-1.5 border border-black/15 rounded-lg text-xs text-teks-sekunder hover:border-arang hover:text-arang transition-colors">Berikutnya →</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
