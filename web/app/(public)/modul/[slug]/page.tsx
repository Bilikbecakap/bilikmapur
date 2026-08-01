import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { fileUrl } from "@/lib/directus";

interface Modul {
  id: string;
  judul: string;
  deskripsi: string | null;
  file_pdf: string;
  gambar_sampul: string | null;
  jumlah_halaman: number | null;
  kategori: string | null;
  warna_penanda: string | null;
  dibuat_pada: Date;
}

const warnaMap: Record<string, string> = {
  "beras-merah": "var(--beras-merah)",
  rimba: "var(--rimba)",
  "kulit-kayu": "var(--kulit-kayu)",
};

async function getModul(slug: string): Promise<Modul | null> {
  const { rows } = await pool.query<Modul>(
    `SELECT id, judul, deskripsi, file_pdf::text, gambar_sampul::text,
            jumlah_halaman, kategori, warna_penanda, dibuat_pada
     FROM modul
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
  const modul = await getModul(slug);
  return {
    title: modul ? `${modul.judul} — Modul Mapur` : "Modul tidak ditemukan",
    description: modul?.deskripsi ?? undefined,
  };
}

export default async function DetailModul({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const modul = await getModul(slug);
  if (!modul) notFound();

  const pdfUrl = fileUrl(modul.file_pdf)!;
  const coverUrl = fileUrl(modul.gambar_sampul);
  const accentColor = modul.warna_penanda
    ? (warnaMap[modul.warna_penanda] ?? "var(--kulit-kayu)")
    : "var(--kulit-kayu)";

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-teks-sekunder flex items-center gap-1.5 mb-10">
        <Link href="/modul" className="hover:text-arang transition-colors">
          Modul
        </Link>
        <span>·</span>
        <span className="text-arang line-clamp-1">{modul.judul}</span>
      </nav>

      {/* Header */}
      <div className="flex gap-6 items-start mb-8">
        {coverUrl && (
          <div className="hidden sm:block w-20 shrink-0 rounded-lg overflow-hidden border border-granit/30 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt={modul.judul} className="w-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div
            className="h-1 w-8 rounded-full mb-4"
            style={{ backgroundColor: accentColor }}
          />
          <h1
            className="text-2xl sm:text-3xl font-semibold text-arang leading-tight mb-3"
            style={{ fontFamily: "var(--font-baloo), Georgia, sans-serif", fontStyle: "italic" }}
          >
            {modul.judul}
          </h1>
          <div className="flex flex-wrap gap-2 mb-3">
            {modul.kategori && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-granit/15 text-teks-sekunder">
                {modul.kategori}
              </span>
            )}
            {modul.jumlah_halaman && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-granit/15 text-teks-sekunder">
                {modul.jumlah_halaman} halaman
              </span>
            )}
          </div>
          {modul.deskripsi && (
            <p className="text-sm text-teks-sekunder leading-relaxed">
              {modul.deskripsi}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <a
          href={pdfUrl}
          download
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-beras-merah text-kapur text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Unduh PDF
        </a>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-granit/50 text-teks-sekunder text-sm hover:border-arang hover:text-arang transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Buka di Tab Baru
        </a>
      </div>

      {/* PDF viewer — iframe native browser */}
      <div className="rounded-xl overflow-hidden border-2 border-granit/50">
        <iframe
          src={pdfUrl}
          className="w-full"
          style={{ height: "75vh", minHeight: "480px" }}
          title={modul.judul}
        />
      </div>

      <div className="mt-8 pt-6 border-t-2 border-granit/40">
        <Link href="/modul" className="text-sm text-teks-sekunder hover:text-arang transition-colors">
          ← Semua Modul
        </Link>
      </div>
    </div>
  );
}
