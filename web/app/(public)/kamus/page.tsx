import type { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";
import CariInput from "@/components/kamus/CariInput";
import KategoriScroll from "@/components/kamus/KategoriScroll";
import EditLemaButton from "@/components/kamus/EditLemaButton";

export const metadata: Metadata = { title: "Kamus Mapur" };

const PER_HAL = 15;

interface EntryRow {
  id: string;
  lema: string;
  arti_indonesia: string;
  contoh_kalimat_mapur: string | null;
  contoh_kalimat_indonesia: string | null;
  kategori: string | null;
  kategori_slug: string | null;
  total_count: string;
}

interface KategoriRow {
  id: number;
  nama: string;
  slug: string;
}

interface HurufRow {
  huruf: string;
  jumlah: string;
}

export default async function KamusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = ((sp.q as string) ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  const kategoriSlug = (sp.kategori as string) ?? "";
  const abjad = ((sp.abjad as string) ?? "").toLowerCase().slice(0, 1);
  const hal = Math.max(1, parseInt((sp.hal as string) ?? "1", 10));
  const offset = (hal - 1) * PER_HAL;

  const session = await getSession();
  const isLoggedIn = !!session;

  const [kategoriResult, hurufResult] = await Promise.all([
    pool.query<KategoriRow>(
      "SELECT id, nama, slug FROM kategori ORDER BY urutan, nama"
    ),
    q
      ? Promise.resolve({ rows: [] as HurufRow[] })
      : pool.query<HurufRow>(
          `SELECT lower(left(lema, 1)) AS huruf, COUNT(*) AS jumlah
           FROM entries WHERE status = 'published'
           GROUP BY 1 ORDER BY 1`
        ),
  ]);

  const kategoriList = kategoriResult.rows;
  const hurufAda = new Set(hurufResult.rows.map((r) => r.huruf));

  const conditions: string[] = ["e.status = 'published'"];
  const params: (string | number)[] = [];

  if (q) {
    params.push(q);
    const idx = params.length;
    conditions.push(
      `(e.search @@ websearch_to_tsquery('simple', $${idx}) OR e.lema % $${idx} OR e.arti_indonesia % $${idx})`
    );
  }
  if (kategoriSlug) {
    params.push(kategoriSlug);
    conditions.push(`k.slug = $${params.length}`);
  }
  if (abjad && !q) {
    params.push(abjad);
    conditions.push(`lower(left(e.lema, 1)) = $${params.length}`);
  }

  const orderBy = q
    ? `ORDER BY (e.search @@ websearch_to_tsquery('simple', $1)) DESC, similarity(e.lema, $1) DESC`
    : `ORDER BY e.lema ASC`;

  params.push(PER_HAL);
  const limitIdx = params.length;
  params.push(offset);
  const offsetIdx = params.length;

  const { rows: entries } = await pool.query<EntryRow>(
    `SELECT e.id, e.lema, e.arti_indonesia,
            e.contoh_kalimat_mapur, e.contoh_kalimat_indonesia,
            k.nama AS kategori, k.slug AS kategori_slug,
            COUNT(*) OVER() AS total_count
     FROM entries e
     LEFT JOIN kategori k ON k.id = e.kategori_id
     WHERE ${conditions.join(" AND ")}
     ${orderBy}
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params
  );

  const total = entries[0]?.total_count ? parseInt(entries[0].total_count, 10) : 0;
  const totalHal = Math.ceil(total / PER_HAL);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const base: Record<string, string | undefined> = {
      q: q || undefined,
      kategori: kategoriSlug || undefined,
      abjad: abjad || undefined,
      hal: hal > 1 ? String(hal) : undefined,
    };
    const merged = { ...base, ...overrides };
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined) p.set(k, v);
    }
    const qs = p.toString();
    return `/kamus${qs ? `?${qs}` : ""}`;
  }

  const ABJAD = "abcdefghijklmnopqrstuvwxyz".split("");

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Title */}
      <div className="mb-8 border-b-2 border-granit/35 pb-6">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-rimba mb-2">Kamus Digital</p>
        <h1
          className="font-semibold text-arang mb-1 leading-tight"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2.25rem", fontStyle: "italic" }}
        >
          Kamus Mapur
        </h1>
        <p className="text-teks-sekunder text-sm" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
          Pencarian dua arah — ketik kata Mapur atau artinya dalam bahasa Indonesia.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <CariInput defaultValue={q} kategoriSlug={kategoriSlug} />
      </div>

      {/* Kategori filter */}
      {kategoriList.length > 0 && (
        <KategoriScroll
          semuaHref={buildUrl({ kategori: undefined, hal: undefined })}
          aktif={kategoriSlug}
          items={kategoriList.map((kat) => ({
            slug: kat.slug,
            nama: kat.nama,
            href: buildUrl({ kategori: kat.slug, hal: undefined }),
          }))}
        />
      )}

      {/* Abjad index */}
      {!q && (
        <div className="flex flex-wrap gap-1 mb-6">
          <Link
            href={buildUrl({ abjad: undefined, hal: undefined })}
            className={`w-8 h-8 flex items-center justify-center rounded text-xs font-medium border transition-colors ${
              !abjad
                ? "bg-rimba text-kapur border-rimba"
                : "border-granit/40 text-teks-sekunder hover:border-rimba hover:text-rimba"
            }`}
          >
            ∗
          </Link>
          {ABJAD.map((huruf) =>
            hurufAda.has(huruf) ? (
              <Link
                key={huruf}
                href={buildUrl({ abjad: huruf, hal: undefined })}
                className={`w-8 h-8 flex items-center justify-center rounded text-xs font-medium border transition-colors ${
                  abjad === huruf
                    ? "bg-rimba text-kapur border-rimba"
                    : "border-granit/40 text-teks-sekunder hover:border-rimba hover:text-rimba"
                }`}
              >
                {huruf.toUpperCase()}
              </Link>
            ) : (
              <span
                key={huruf}
                className="w-8 h-8 flex items-center justify-center rounded text-xs border border-granit/20 text-granit/35"
              >
                {huruf.toUpperCase()}
              </span>
            )
          )}
        </div>
      )}

      {/* Count */}
      <p className="text-xs text-teks-sekunder mb-4">
        {q ? (
          <>
            <strong className="text-arang font-semibold">{total}</strong> hasil untuk &ldquo;
            <strong className="text-arang font-semibold">{q}</strong>&rdquo;
          </>
        ) : (
          <>
            <strong className="text-arang font-semibold">{total.toLocaleString("id-ID")}</strong>{" "}
            kata{abjad && <> diawali <strong className="text-arang font-semibold">{abjad.toUpperCase()}</strong></>}
          </>
        )}
      </p>

      {/* Entry table */}
      {entries.length === 0 ? (
        <div className="text-center py-20 text-teks-sekunder">
          {q ? `Tidak ada hasil untuk "${q}".` : "Belum ada kata dalam kamus."}
        </div>
      ) : (
        <div className="rounded-sm border border-granit/25 overflow-x-auto bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-kapur/50 border-b border-granit/20">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide w-1/5">Kata Mapur</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide w-1/5">Arti</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide w-2/5">Contoh Kalimat</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide hidden sm:table-cell w-36">Kategori</th>
                {isLoggedIn && <th className="w-10" />}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={entry.id}
                  className={`hover:bg-kapur/40 transition-colors ${i !== 0 ? "border-t border-granit/15" : ""}`}
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/kamus/${entry.id}`}
                      className="font-semibold text-base italic hover:opacity-80 transition-opacity"
                      style={{ color: "var(--kulit-kayu)" }}
                    >
                      {entry.lema}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-arang font-medium">{entry.arti_indonesia}</td>
                  <td className="px-5 py-4">
                    {entry.contoh_kalimat_mapur || entry.contoh_kalimat_indonesia ? (
                      <div>
                        {entry.contoh_kalimat_mapur && (
                          <p className="text-sm italic line-clamp-1 leading-relaxed" style={{ color: "var(--kulit-kayu)" }}>
                            {entry.contoh_kalimat_mapur}
                          </p>
                        )}
                        {entry.contoh_kalimat_indonesia && (
                          <p className="text-xs text-teks-sekunder line-clamp-1 mt-0.5 leading-relaxed">
                            {entry.contoh_kalimat_indonesia}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-granit/35">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    {entry.kategori ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-rimba/10 text-rimba font-medium whitespace-nowrap">
                        {entry.kategori}
                      </span>
                    ) : (
                      <span className="text-granit/35">—</span>
                    )}
                  </td>
                  {isLoggedIn && (
                    <td className="pr-3 py-4 text-right">
                      <EditLemaButton entryId={entry.id} variant="icon" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalHal > 1 && (
        <div className="flex items-center justify-between mt-6">
          <span className="text-xs text-teks-sekunder">Hal. {hal} / {totalHal}</span>
          <div className="flex gap-2">
            {hal > 1 && (
              <Link
                href={buildUrl({ hal: String(hal - 1) })}
                className="px-3 py-1.5 border border-granit/40 rounded-lg text-xs text-teks-sekunder hover:border-arang hover:text-arang transition-colors"
              >
                ← Sebelumnya
              </Link>
            )}
            {hal < totalHal && (
              <Link
                href={buildUrl({ hal: String(hal + 1) })}
                className="px-3 py-1.5 border border-granit/40 rounded-lg text-xs text-teks-sekunder hover:border-arang hover:text-arang transition-colors"
              >
                Berikutnya →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-14 pt-8 border-t-2 border-granit/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-teks-sekunder">
          Tahu kata Mapur yang belum ada di kamus?
        </p>
        <Link
          href="/usulan"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rimba text-kapur text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
        >
          Usulkan Lema Baru
        </Link>
      </div>
    </div>
  );
}
