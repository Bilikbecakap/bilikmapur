import type { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";
import { fileUrl } from "@/lib/directus";
import KategoriScroll from "@/components/kamus/KategoriScroll";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Artikel — Mapur" };

interface ArtikelRow {
  id: string;
  judul: string;
  slug: string;
  ringkasan: string | null;
  penulis: string | null;
  kategori: string | null;
  gambar_sampul: string | null;
  warna_penanda: "beras-merah" | "rimba" | "kulit-kayu" | null;
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

export default async function ArtikelPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const kategoriAktif = (sp.kategori ?? "").trim();

  const [{ rows: artikelList }, { rows: kategoriRows }] = await Promise.all([
    pool.query<ArtikelRow>(
      `SELECT id, judul, slug, ringkasan, penulis, kategori, gambar_sampul::text, warna_penanda, dibuat_pada
       FROM artikel
       WHERE status = 'published' AND dihapus_pada IS NULL
       ${kategoriAktif ? "AND kategori = $1" : ""}
       ORDER BY dibuat_pada DESC`,
      kategoriAktif ? [kategoriAktif] : []
    ),
    pool.query<{ kategori: string }>(
      `SELECT DISTINCT kategori FROM artikel
       WHERE status = 'published' AND dihapus_pada IS NULL AND kategori IS NOT NULL
       ORDER BY kategori`
    ),
  ]);

  const kategoriList = kategoriRows.map((r) => r.kategori);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 border-b-2 border-granit/35 pb-6">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-rimba mb-2">Pustaka</p>
        <h1
          className="font-semibold text-arang mb-1 leading-tight"
          style={{ fontFamily: "var(--font-baloo), Georgia, sans-serif", fontSize: "2.25rem", fontStyle: "italic" }}
        >
          Artikel
        </h1>
        <p className="text-teks-sekunder text-sm" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
          Tulisan tentang bahasa, budaya, dan sejarah masyarakat Mapur.
        </p>
      </div>

      {kategoriList.length > 0 && (
        <KategoriScroll
          semuaHref="/artikel"
          aktif={kategoriAktif}
          items={kategoriList.map((k) => ({ slug: k, nama: k, href: `/artikel?kategori=${encodeURIComponent(k)}` }))}
        />
      )}

      {artikelList.length === 0 ? (
        <div className="text-center py-20 text-teks-sekunder">
          {kategoriAktif ? `Belum ada artikel di kategori "${kategoriAktif}".` : "Belum ada artikel yang dipublikasikan."}
        </div>
      ) : (
        <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artikelList.map((artikel) => (
            <ArtikelCard key={artikel.id} artikel={artikel} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArtikelCard({ artikel }: { artikel: ArtikelRow }) {
  const coverUrl = fileUrl(artikel.gambar_sampul);
  const accentColor = artikel.warna_penanda ? warnaMap[artikel.warna_penanda] : "var(--rimba)";

  return (
    <Link
      href={`/artikel/${artikel.slug}`}
      className="group flex flex-col rounded-xl overflow-hidden border-2 border-granit/30 bg-white hover:border-rimba hover:shadow-sm transition-all"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-rumbia/50">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={artikel.judul}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ color: accentColor, opacity: 0.4 }}>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
        )}
        {artikel.kategori && (
          <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-kapur/95 text-rimba shadow-sm">
            {artikel.kategori}
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-2 text-xs text-teks-sekunder">
          {artikel.penulis && (
            <>
              <span className="font-medium">{artikel.penulis}</span>
              <span className="text-granit/40">·</span>
            </>
          )}
          <span>{formatTanggal(artikel.dibuat_pada)}</span>
        </div>
        <h3
          className="font-semibold text-arang text-base leading-snug mb-2 group-hover:text-rimba transition-colors line-clamp-2"
          style={{ fontFamily: "var(--font-baloo), Georgia, sans-serif" }}
        >
          {artikel.judul}
        </h3>
        {artikel.ringkasan && (
          <p className="text-sm text-teks-sekunder line-clamp-3 leading-relaxed mb-3">
            {artikel.ringkasan}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-rimba">
          Baca selengkapnya
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
