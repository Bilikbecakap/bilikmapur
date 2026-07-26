import type { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";
import { fileUrl } from "@/lib/directus";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Modul — Mapur" };

interface ModulRow {
  id: string;
  judul: string;
  slug: string;
  deskripsi: string | null;
  gambar_sampul: string | null;
  jumlah_halaman: number | null;
  kategori: string | null;
  warna_penanda: string | null;
}

const warnaMap: Record<string, string> = {
  "beras-merah": "var(--beras-merah)",
  rimba: "var(--rimba)",
  "kulit-kayu": "var(--kulit-kayu)",
};

export default async function ModulPage() {
  const { rows: modulList } = await pool.query<ModulRow>(
    `SELECT id, judul, slug, deskripsi, gambar_sampul::text,
            jumlah_halaman, kategori, warna_penanda
     FROM modul
     WHERE status = 'published'
     ORDER BY urutan ASC, dibuat_pada DESC`
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 border-b-2 border-granit/35 pb-6">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-rimba mb-2">Materi Belajar</p>
        <h1
          className="font-semibold text-arang mb-1 leading-tight"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2.25rem", fontStyle: "italic" }}
        >
          Modul
        </h1>
        <p className="text-teks-sekunder text-sm" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
          Bahan ajar dan modul belajar bahasa Mapur dalam format PDF.
        </p>
      </div>

      {modulList.length === 0 ? (
        <div className="text-center py-20 text-teks-sekunder">
          Belum ada modul yang dipublikasikan.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {modulList.map((modul) => {
            const coverUrl = fileUrl(modul.gambar_sampul);
            const accentColor = modul.warna_penanda
              ? (warnaMap[modul.warna_penanda] ?? "var(--kulit-kayu)")
              : "var(--kulit-kayu)";

            return (
              <Link
                key={modul.id}
                href={`/modul/${modul.slug}`}
                className="flex flex-col rounded-xl overflow-hidden border-2 border-granit/40 hover:border-rimba hover:shadow-sm hover:-translate-y-0.5 transition-all group"
              >
                {/* Cover */}
                <div className="relative aspect-[3/4] overflow-hidden bg-rumbia/60">
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverUrl}
                      alt={modul.judul}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: accentColor, opacity: 0.5 }}
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                      <span className="text-[10px] font-medium text-teks-sekunder">PDF</span>
                    </div>
                  )}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 p-3">
                  <h2 className="font-semibold text-arang text-sm leading-snug mb-1 group-hover:text-rimba transition-colors line-clamp-2">
                    {modul.judul}
                  </h2>
                  <div className="flex items-center gap-1.5 flex-wrap mt-auto pt-1">
                    {modul.kategori && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-granit/12 text-teks-sekunder">
                        {modul.kategori}
                      </span>
                    )}
                    {modul.jumlah_halaman && (
                      <span className="text-[10px] text-teks-sekunder">
                        {modul.jumlah_halaman} hlm
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
