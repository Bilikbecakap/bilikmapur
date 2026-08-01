import type { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [entries, submissions, artikel, video, modul] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM entries WHERE status = 'published' AND dihapus_pada IS NULL"),
    pool.query("SELECT COUNT(*) FROM submissions WHERE status = 'pending'"),
    pool.query("SELECT COUNT(*) FROM artikel WHERE status = 'published' AND dihapus_pada IS NULL"),
    pool.query("SELECT COUNT(*) FROM video WHERE status = 'published' AND dihapus_pada IS NULL"),
    pool.query("SELECT COUNT(*) FROM modul WHERE status = 'published' AND dihapus_pada IS NULL"),
  ]);

  const stats = [
    { label: "Lema kamus", value: entries.rows[0].count, href: "/admin/kamus", color: "var(--kulit-kayu)" },
    { label: "Usulan pending", value: submissions.rows[0].count, href: "/admin/usulan", color: "var(--beras-merah)" },
    { label: "Artikel", value: artikel.rows[0].count, href: "/admin/artikel", color: "var(--rimba)" },
    { label: "Video", value: video.rows[0].count, href: "/admin/video", color: "var(--teks-sekunder)" },
    { label: "Modul PDF", value: modul.rows[0].count, href: "/admin/modul", color: "var(--teks-sekunder)" },
  ];

  const shortcuts = [
    {
      href: "/admin/usulan",
      title: "Tinjau Usulan",
      desc: "Setujui atau tolak usulan kata baru dari kontributor anonim.",
      accent: true,
    },
    {
      href: "/admin/kamus/baru",
      title: "Tambah Lema",
      desc: "Tambahkan kata baru langsung ke kamus tanpa melalui antrian usulan.",
      accent: false,
    },
    {
      href: "/admin/artikel/baru",
      title: "Tulis Artikel",
      desc: "Buat artikel baru tentang bahasa, budaya, atau sejarah Mapur.",
      accent: false,
    },
    {
      href: "/admin/modul/baru",
      title: "Unggah Modul",
      desc: "Tambahkan buku atau modul PDF ke halaman Modul.",
      accent: false,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-arang mb-1">Dashboard</h1>
        <p className="text-sm text-teks-sekunder">Ringkasan konten situs Bahasa Mapur.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map(({ label, value, href, color }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border border-granit/25 bg-white p-5 hover:border-granit/50 hover:shadow-sm transition-all"
          >
            <p className="text-3xl font-semibold mb-1 tabular-nums" style={{ color }}>{value}</p>
            <p className="text-xs text-teks-sekunder leading-snug">{label}</p>
          </Link>
        ))}
      </div>

      {/* Shortcut cards */}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-teks-sekunder mb-3">Akses Cepat</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {shortcuts.map(({ href, title, desc, accent }) => (
          <Link
            key={href}
            href={href}
            className={`rounded-xl border p-5 transition-all ${
              accent
                ? "border-beras-merah/30 bg-beras-merah/5 hover:bg-beras-merah/10"
                : "border-granit/25 bg-white hover:border-granit/50 hover:shadow-sm"
            }`}
          >
            <h3 className="font-semibold text-arang mb-1 text-sm">{title}</h3>
            <p className="text-xs text-teks-sekunder leading-relaxed">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
