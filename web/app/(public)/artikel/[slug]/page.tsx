import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { fileUrl } from "@/lib/directus";

interface Artikel {
  id: string;
  judul: string;
  ringkasan: string | null;
  konten: string | null;
  penulis: string | null;
  kategori: string | null;
  gambar_sampul: string | null;
  warna_penanda: string | null;
  dibuat_pada: Date;
  diperbarui_pada: Date;
}

interface ArtikelRingkas {
  judul: string;
  slug: string;
  gambar_sampul: string | null;
  dibuat_pada: Date;
}

const warnaMap: Record<string, string> = {
  "beras-merah": "var(--beras-merah)",
  rimba: "var(--rimba)",
  "kulit-kayu": "var(--kulit-kayu)",
};

function formatTanggal(d: Date): string {
  return new Date(d).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function getArtikel(slug: string): Promise<Artikel | null> {
  const { rows } = await pool.query<Artikel>(
    `SELECT id, judul, ringkasan, konten, penulis, kategori,
            gambar_sampul::text, warna_penanda, dibuat_pada, diperbarui_pada
     FROM artikel
     WHERE slug = $1 AND status = 'published' AND dihapus_pada IS NULL`,
    [slug]
  );
  return rows[0] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artikel = await getArtikel(slug);
  return {
    title: artikel ? `${artikel.judul} — Mapur` : "Artikel tidak ditemukan",
    description: artikel?.ringkasan ?? undefined,
  };
}

export default async function DetailArtikel({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artikel = await getArtikel(slug);
  if (!artikel) notFound();

  const [{ rows: kategoriRows }, { rows: lainnya }] = await Promise.all([
    pool.query<{ kategori: string }>(
      `SELECT DISTINCT kategori FROM artikel
       WHERE status = 'published' AND dihapus_pada IS NULL AND kategori IS NOT NULL
       ORDER BY kategori`
    ),
    pool.query<ArtikelRingkas>(
      `SELECT judul, slug, gambar_sampul::text, dibuat_pada FROM artikel
       WHERE status = 'published' AND dihapus_pada IS NULL AND id != $1
       ORDER BY dibuat_pada DESC LIMIT 4`,
      [artikel.id]
    ),
  ]);
  const kategoriList = kategoriRows.map((r) => r.kategori);

  const coverUrl = fileUrl(artikel.gambar_sampul);
  const accentColor = artikel.warna_penanda
    ? (warnaMap[artikel.warna_penanda] ?? "var(--granit)")
    : "var(--granit)";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-teks-sekunder flex items-center gap-1.5 mb-10">
        <Link href="/artikel" className="hover:text-arang transition-colors">
          Artikel
        </Link>
        <span>·</span>
        <span className="text-arang line-clamp-1">{artikel.judul}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_320px] gap-x-12 gap-y-10 items-start">
        {/* ── Konten utama ── */}
        <article className="min-w-0">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-[3px] w-12 rounded-full" style={{ backgroundColor: accentColor }} />
            {artikel.kategori && (
              <Link
                href={`/artikel?kategori=${encodeURIComponent(artikel.kategori)}`}
                className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-rimba/10 text-rimba hover:bg-rimba/20 transition-colors"
              >
                {artikel.kategori}
              </Link>
            )}
          </div>
          <h1
            className="text-3xl sm:text-4xl font-semibold text-arang leading-tight mb-4"
            style={{ fontFamily: "var(--font-baloo), Georgia, sans-serif", fontStyle: "italic" }}
          >
            {artikel.judul}
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-teks-sekunder mb-8">
            {artikel.penulis && (
              <>
                <span className="font-medium">{artikel.penulis}</span>
                <span className="text-granit/40">·</span>
              </>
            )}
            <span>{formatTanggal(artikel.dibuat_pada)}</span>
          </div>

          {artikel.ringkasan && (
            <p className="text-base text-teks-sekunder leading-relaxed mb-8 pb-8 border-b-2 border-granit/40 italic">
              {artikel.ringkasan}
            </p>
          )}

          {coverUrl ? (
            <div className="mb-10 rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt={artikel.judul} className="w-full object-cover max-h-[480px]" />
            </div>
          ) : (
            <div className="mb-10 aspect-[21/9] w-full rounded-xl border-2 border-dashed border-granit/35 bg-rumbia/25 flex flex-col items-center justify-center gap-2.5">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-granit/45">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <p className="text-xs text-granit/50">Gambar sampul artikel</p>
            </div>
          )}

          {artikel.konten ? (
            <div className="prose-mapur max-w-2xl" dangerouslySetInnerHTML={{ __html: artikel.konten }} />
          ) : (
            <p className="text-teks-sekunder italic">Konten artikel belum tersedia.</p>
          )}

          <div className="mt-14 pt-6 border-t border-granit/25">
            <Link href="/artikel" className="text-sm text-teks-sekunder hover:text-arang transition-colors">
              ← Semua Artikel
            </Link>
          </div>
        </article>

        {/* ── Sidebar ── */}
        <aside className="lg:sticky lg:top-24 flex flex-col gap-6">
          {/* Kategori */}
          {kategoriList.length > 0 && (
            <div className="rounded-xl border-2 border-granit/30 bg-white p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-teks-sekunder mb-4">Kategori</h2>
              <div className="flex flex-wrap gap-2">
                {kategoriList.map((k) => (
                  <Link
                    key={k}
                    href={`/artikel?kategori=${encodeURIComponent(k)}`}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      k === artikel.kategori
                        ? "bg-rimba text-kapur border-rimba"
                        : "border-granit/40 text-teks-sekunder hover:border-rimba hover:text-rimba"
                    }`}
                  >
                    {k}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Artikel lainnya */}
          {lainnya.length > 0 && (
            <div className="rounded-xl border-2 border-granit/30 bg-white p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-teks-sekunder mb-4">Artikel Lainnya</h2>
              <div className="flex flex-col gap-4">
                {lainnya.map((a) => {
                  const thumb = fileUrl(a.gambar_sampul);
                  return (
                    <Link key={a.slug} href={`/artikel/${a.slug}`} className="group flex gap-3 items-start">
                      <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-rumbia/50">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt={a.judul} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-granit/40">
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-arang leading-snug line-clamp-2 group-hover:text-rimba transition-colors">
                          {a.judul}
                        </p>
                        <p className="text-[11px] text-teks-sekunder mt-1">{formatTanggal(a.dibuat_pada)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ajakan kontribusi */}
          <div className="rounded-xl border-2 border-beras-merah/25 bg-beras-merah/5 p-5">
            <h2 className="text-sm font-semibold text-arang mb-1.5">Punya cerita untuk dibagikan?</h2>
            <p className="text-xs text-teks-sekunder leading-relaxed mb-4">
              Kami terbuka untuk usulan artikel baru tentang bahasa, budaya, atau tradisi Mapur dari siapa saja.
            </p>
            <Link
              href="/tentang#hubungi-kami"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-kapur bg-beras-merah px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Ajukan Artikel
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
