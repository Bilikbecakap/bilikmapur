import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { fileUrl } from "@/lib/directus";
import { getSession } from "@/lib/auth";
import EditLemaButton from "@/components/kamus/EditLemaButton";

interface EntryDetail {
  id: string;
  lema: string;
  arti_indonesia: string;
  contoh_kalimat_mapur: string | null;
  contoh_kalimat_indonesia: string | null;
  pelafalan_ipa: string | null;
  audio: string | null;
  catatan: string | null;
  sumber: string | null;
  kategori: string | null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getEntry(id: string): Promise<EntryDetail | null> {
  if (!UUID_RE.test(id)) return null;
  const { rows } = await pool.query<EntryDetail>(
    `SELECT e.id, e.lema, e.arti_indonesia,
            e.contoh_kalimat_mapur, e.contoh_kalimat_indonesia,
            e.pelafalan_ipa, e.audio::text, e.catatan, e.sumber,
            k.nama AS kategori
     FROM entries e
     LEFT JOIN kategori k ON k.id = e.kategori_id
     WHERE e.id = $1 AND e.status = 'published'`,
    [id]
  );
  return rows[0] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const entry = await getEntry(id);
  return {
    title: entry ? `${entry.lema} — Kamus Mapur` : "Lema tidak ditemukan",
  };
}

export default async function DetailLema({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [entry, session] = await Promise.all([getEntry(id), getSession()]);
  if (!entry) notFound();

  const isLoggedIn = !!session;
  const audioUrl = fileUrl(entry.audio);
  const adaContoh = entry.contoh_kalimat_mapur || entry.contoh_kalimat_indonesia;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-teks-sekunder flex items-center gap-1.5 mb-10">
        <Link href="/kamus" className="hover:text-arang transition-colors">
          Kamus
        </Link>
        <span>·</span>
        <span style={{ fontStyle: "italic", color: "var(--kulit-kayu)" }}>
          {entry.lema}
        </span>
      </nav>

      {/* Lema heading */}
      <div className="mb-10">
        <h1
          className="text-5xl font-semibold mb-3 leading-tight"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontStyle: "italic",
            color: "var(--kulit-kayu)",
          }}
        >
          {entry.lema}
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          {entry.kategori && (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-granit/15 text-teks-sekunder">
              {entry.kategori}
            </span>
          )}
          {entry.pelafalan_ipa && (
            <span className="text-sm text-teks-sekunder font-mono">
              /{entry.pelafalan_ipa}/
            </span>
          )}
        </div>
      </div>

      {/* Audio — player atau wireframe placeholder */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-teks-sekunder uppercase tracking-widest mb-2">
          Dengarkan
        </p>
        {audioUrl ? (
          <audio controls className="w-full" src={audioUrl}>
            Browser Anda tidak mendukung pemutaran audio.
          </audio>
        ) : (
          <div className="h-12 w-full rounded-lg border-2 border-dashed border-granit/35 bg-rumbia/20 flex items-center gap-3 px-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-granit/45 shrink-0">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10 8 16 12 10 16 10 8"/>
            </svg>
            <div className="flex-1 h-1.5 bg-granit/20 rounded-full" />
            <span className="text-xs text-granit/40">—:——</span>
          </div>
        )}
      </div>

      {/* Arti */}
      <div className="mb-8 pb-8 border-b-2 border-granit/40">
        <p className="text-[11px] font-semibold text-teks-sekunder uppercase tracking-widest mb-2">
          Arti dalam Bahasa Indonesia
        </p>
        <p className="text-xl text-arang leading-relaxed">{entry.arti_indonesia}</p>
      </div>

      {/* Contoh */}
      {adaContoh && (
        <div className="mb-8 pb-8 border-b-2 border-granit/40">
          <p className="text-[11px] font-semibold text-teks-sekunder uppercase tracking-widest mb-4">
            Contoh Kalimat
          </p>
          <blockquote className="border-l-2 border-kulit-kayu pl-5 space-y-1.5">
            {entry.contoh_kalimat_mapur && (
              <p
                className="text-base font-medium leading-relaxed"
                style={{ fontStyle: "italic", color: "var(--kulit-kayu)" }}
              >
                {entry.contoh_kalimat_mapur}
              </p>
            )}
            {entry.contoh_kalimat_indonesia && (
              <p className="text-sm text-teks-sekunder leading-relaxed">
                {entry.contoh_kalimat_indonesia}
              </p>
            )}
          </blockquote>
        </div>
      )}

      {/* Catatan */}
      {entry.catatan && (
        <div className="mb-8 pb-8 border-b-2 border-granit/40">
          <p className="text-[11px] font-semibold text-teks-sekunder uppercase tracking-widest mb-2">
            Catatan
          </p>
          <p className="text-sm text-teks-sekunder leading-relaxed">{entry.catatan}</p>
        </div>
      )}

      {/* Sumber */}
      {entry.sumber && (
        <div className="mb-8 pb-8 border-b-2 border-granit/40">
          <p className="text-[11px] font-semibold text-teks-sekunder uppercase tracking-widest mb-2">
            Sumber / Atribusi
          </p>
          <p className="text-sm text-teks-sekunder italic">{entry.sumber}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        {isLoggedIn && (
          <EditLemaButton entryId={entry.id} variant="button" />
        )}
        <Link
          href={`/usulan?aksi=edit&target=${entry.id}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-granit/50 text-teks-sekunder text-sm hover:border-arang hover:text-arang transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Usulkan koreksi
        </Link>
        <Link
          href="/kamus"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-granit/50 text-teks-sekunder text-sm hover:border-arang hover:text-arang transition-colors"
        >
          ← Kembali ke kamus
        </Link>
      </div>
    </div>
  );
}
