import type { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Artikel — Mapur" };

interface ArtikelRow {
  id: string;
  judul: string;
  slug: string;
  ringkasan: string | null;
  penulis: string | null;
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

export default async function ArtikelPage() {
  const { rows: artikelList } = await pool.query<ArtikelRow>(
    `SELECT id, judul, slug, ringkasan, penulis, warna_penanda, dibuat_pada
     FROM artikel
     WHERE status = 'published'
     ORDER BY dibuat_pada DESC`
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 border-b-2 border-granit/35 pb-6">
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

      {artikelList.length === 0 ? (
        <div className="text-center py-20 text-teks-sekunder">
          Belum ada artikel yang dipublikasikan.
        </div>
      ) : (
        <div className="space-y-3">
          {artikelList.map((artikel) => {
            const accentColor = artikel.warna_penanda
              ? warnaMap[artikel.warna_penanda]
              : "var(--rimba)";
            return (
              <Link
                key={artikel.id}
                href={`/artikel/${artikel.slug}`}
                className="flex rounded-xl border-2 border-granit/40 overflow-hidden hover:border-rimba hover:shadow-sm transition-all group"
              >
                <div
                  className="w-[4px] shrink-0"
                  style={{ backgroundColor: accentColor }}
                />
                <div className="flex-1 px-6 py-5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-2">
                    {artikel.penulis && (
                      <span className="text-xs text-teks-sekunder font-medium">
                        {artikel.penulis}
                      </span>
                    )}
                    {artikel.penulis && (
                      <span className="text-granit/40 text-xs">·</span>
                    )}
                    <span className="text-xs text-teks-sekunder">
                      {formatTanggal(artikel.dibuat_pada)}
                    </span>
                  </div>
                  <h2 className="font-semibold text-arang text-lg leading-snug mb-2 group-hover:text-rimba transition-colors line-clamp-2"
                    style={{ fontFamily: "var(--font-baloo), Georgia, sans-serif", fontSize: "1.2rem" }}>
                    {artikel.judul}
                  </h2>
                  {artikel.ringkasan && (
                    <p className="text-sm text-teks-sekunder line-clamp-2 leading-relaxed">
                      {artikel.ringkasan}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
