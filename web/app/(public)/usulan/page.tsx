import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import pool from "@/lib/db";
import FormUsulan from "@/components/usulan/FormUsulan";

export const metadata: Metadata = { title: "Usulkan Kata — Kamus Mapur" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function UsulanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawAksi = (sp.aksi as string) ?? "tambah";
  const aksi = (["tambah", "edit", "hapus"].includes(rawAksi)
    ? rawAksi
    : "tambah") as "tambah" | "edit" | "hapus";
  const targetId = (sp.target as string) ?? "";

  const { rows: kategoriList } = await pool.query(
    "SELECT id, nama, slug FROM kategori ORDER BY urutan, nama"
  );

  let entryAwal = null;
  if ((aksi === "edit" || aksi === "hapus") && targetId) {
    if (!UUID_RE.test(targetId)) return notFound();
    const { rows } = await pool.query(
      `SELECT e.id, e.lema, k.slug AS kategori_slug,
              e.arti_indonesia, e.contoh_kalimat_mapur, e.contoh_kalimat_indonesia,
              e.catatan, e.sumber
       FROM entries e
       LEFT JOIN kategori k ON k.id = e.kategori_id
       WHERE e.id = $1 AND e.status = 'published'`,
      [targetId]
    );
    if (!rows[0]) return notFound();
    entryAwal = rows[0];
  }

  const judul =
    aksi === "tambah"
      ? "Usulkan Kata Baru"
      : aksi === "edit"
      ? "Usulkan Koreksi"
      : "Usulkan Penghapusan";

  const deskripsi =
    aksi === "tambah"
      ? "Tambahkan kata bahasa Mapur yang belum ada di kamus. Usulan ditinjau admin sebelum ditayangkan."
      : aksi === "edit"
      ? "Usulkan perbaikan data kata yang sudah ada. Perubahan ditinjau admin sebelum diterapkan."
      : "Usulkan penghapusan kata ini beserta alasan yang jelas.";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-teks-sekunder flex items-center gap-1.5 mb-10">
        <Link href="/kamus" className="hover:text-arang transition-colors">
          Kamus
        </Link>
        <span>·</span>
        <span className="text-arang">{judul}</span>
      </nav>

      <h1
        className="font-semibold text-arang mb-2 leading-tight"
        style={{ fontFamily: "var(--font-baloo), Georgia, sans-serif", fontSize: "2.25rem", fontStyle: "italic" }}
      >
        {judul}
      </h1>
      <p className="text-teks-sekunder text-sm mb-8 leading-relaxed" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>{deskripsi}</p>

      <FormUsulan
        aksi={aksi}
        kategoriList={kategoriList}
        entryAwal={entryAwal}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
      />
    </div>
  );
}
