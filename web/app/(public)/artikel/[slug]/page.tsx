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
  gambar_sampul: string | null;
  warna_penanda: string | null;
  dibuat_pada: Date;
  diperbarui_pada: Date;
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
    `SELECT id, judul, ringkasan, konten, penulis,
            gambar_sampul::text, warna_penanda, dibuat_pada, diperbarui_pada
     FROM artikel
     WHERE slug = $1 AND status = 'published'`,
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

  const coverUrl = fileUrl(artikel.gambar_sampul);
  const accentColor = artikel.warna_penanda
    ? (warnaMap[artikel.warna_penanda] ?? "var(--granit)")
    : "var(--granit)";

  return (
    <article className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-teks-sekunder flex items-center gap-1.5 mb-10">
        <Link href="/artikel" className="hover:text-arang transition-colors">
          Artikel
        </Link>
        <span>·</span>
        <span className="text-arang line-clamp-1">{artikel.judul}</span>
      </nav>

      {/* Judul */}
      <div className="mb-8">
        <div
          className="h-[3px] w-12 rounded-full mb-5"
          style={{ backgroundColor: accentColor }}
        />
        <h1
          className="text-3xl sm:text-4xl font-semibold text-arang leading-tight mb-4"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic" }}
        >
          {artikel.judul}
        </h1>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-teks-sekunder">
          {artikel.penulis && (
            <>
              <span className="font-medium">{artikel.penulis}</span>
              <span className="text-granit/40">·</span>
            </>
          )}
          <span>{formatTanggal(artikel.dibuat_pada)}</span>
        </div>
      </div>

      {/* Ringkasan */}
      {artikel.ringkasan && (
        <p className="text-base text-teks-sekunder leading-relaxed mb-8 pb-8 border-b-2 border-granit/40 italic">
          {artikel.ringkasan}
        </p>
      )}

      {/* Gambar sampul — foto atau wireframe placeholder */}
      {coverUrl ? (
        <div className="mb-10 rounded-xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt={artikel.judul}
            className="w-full object-cover max-h-[400px]"
          />
        </div>
      ) : (
        <div className="mb-10 aspect-video w-full rounded-xl border-2 border-dashed border-granit/35 bg-rumbia/25 flex flex-col items-center justify-center gap-2.5">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-granit/45">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <p className="text-xs text-granit/50">Gambar sampul artikel</p>
        </div>
      )}

      {/* Konten — HTML dari Directus WYSIWYG (admin-generated, trusted) */}
      {artikel.konten ? (
        <div
          className="prose-mapur"
          dangerouslySetInnerHTML={{ __html: artikel.konten }}
        />
      ) : (
        <p className="text-teks-sekunder italic">Konten artikel belum tersedia.</p>
      )}

      {/* Footer */}
      <div className="mt-14 pt-6 border-t border-granit/25">
        <Link
          href="/artikel"
          className="text-sm text-teks-sekunder hover:text-arang transition-colors"
        >
          ← Semua Artikel
        </Link>
      </div>
    </article>
  );
}
