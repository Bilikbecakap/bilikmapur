import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tentang — Bilik Mapur",
  description:
    "Tentang proyek digitalisasi bahasa Mapur — bahasa daerah masyarakat adat Pulau Bangka, dikelola Yayasan Basamudera Budaya Teknologi bersama komunitas.",
};

export default function TentangPage() {
  return (
    <>
      {/* ── Header ── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 border-b-2 border-granit/35 pb-6">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-rimba mb-2">
            Tentang Proyek
          </p>
          <h1
            className="font-semibold text-arang mb-2 leading-tight"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "2.25rem",
              fontStyle: "italic",
            }}
          >
            Bilik Mapur
          </h1>
          <p className="text-teks-sekunder text-sm max-w-2xl" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
            Ruang digital untuk mendokumentasikan, mempelajari, dan mewariskan bahasa serta
            budaya masyarakat adat <span className="istilah-mapur">Mapur</span> dari Pulau Bangka.
          </p>
        </div>

        {/* ── Tentang Bahasa Mapur ── */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-stretch">
            {/* Kiri — teks */}
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-rimba mb-3">
                  Bahasa
                </p>
                <h2
                  className="font-semibold text-arang mb-4 leading-tight"
                  style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "1.75rem",
                    fontStyle: "italic",
                  }}
                >
                  Tentang Bahasa Mapur
                </h2>
                <div className="flex flex-col gap-4 text-sm leading-relaxed text-teks-sekunder" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
                  <p>
                    Bahasa Mapur adalah bahasa daerah yang dituturkan oleh masyarakat adat Mapur
                    di kawasan Gunung Maras, Kabupaten Bangka, Provinsi Kepulauan Bangka Belitung.
                    Termasuk dalam rumpun bahasa Austronesia cabang Melayik, bahasa ini berkerabat
                    erat dengan Melayu Bangka namun menyimpan kosakata, pelafalan, dan ungkapan khas
                    yang mencerminkan hubungan erat komunitasnya dengan alam sekitar.
                  </p>
                  <p>
                    Penutur bahasa Mapur terpusat di kawasan Dusun Aik Abik dan sekitarnya.
                    Seperti banyak bahasa daerah di Nusantara, bahasa Mapur menghadapi tekanan
                    pergeseran bahasa yang nyata — penuturnya menua, sementara generasi muda
                    kian jarang menggunakannya dalam keseharian.
                  </p>
                  <p>
                    Digitalisasi menjadi salah satu ikhtiar untuk merekam, membakukan, dan
                    membuka kembali akses terhadap bahasa ini bagi siapa pun yang ingin
                    mengenal dan mempelajarinya.
                  </p>
                </div>
              </div>

              {/* Fakta singkat */}
              <div className="grid grid-cols-2 gap-3 mt-auto">
                {[
                  { label: "Rumpun", nilai: "Austronesia · Melayik" },
                  { label: "Wilayah", nilai: "Gunung Maras, Bangka" },
                  { label: "Status", nilai: "Terancam punah" },
                  { label: "Pusat tutur", nilai: "Dusun Aik Abik" },
                ].map(({ label, nilai }) => (
                  <div key={label} className="border-t-2 border-rimba/30 pt-3">
                    <p className="text-[9px] font-semibold tracking-[0.15em] uppercase text-rimba mb-1">
                      {label}
                    </p>
                    <p className="text-xs text-arang font-medium">{nilai}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Kanan — wireframe foto */}
            <div
              className="relative flex-1 min-h-[280px] rounded-sm overflow-hidden border-2 border-dashed border-granit/40"
              style={{ background: "#E8E6E0" }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-40">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                  <rect x="4" y="4" width="32" height="32" rx="3" stroke="#33503C" strokeWidth="1.5" />
                  <circle cx="14" cy="15" r="4" stroke="#33503C" strokeWidth="1.5" />
                  <path d="M4 28 L12 20 L20 26 L28 18 L36 28" stroke="#33503C" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                <p className="text-[11px] font-medium tracking-wider uppercase text-center leading-relaxed" style={{ color: "#33503C" }}>
                  Foto Komunitas<br />Mapur
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Dibalik Proyek ── */}
        <section className="mb-16 pt-12 border-t-2 border-granit/30">
          <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-rimba mb-3">
            Penyelenggara
          </p>
          <h2
            className="font-semibold text-arang mb-8 leading-tight"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.75rem",
              fontStyle: "italic",
            }}
          >
            Di balik Bilik Mapur
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Yayasan Basamudera */}
            <div className="rounded-sm border-2 border-granit/30 p-6 bg-kapur">
              <div className="w-8 h-[3px] bg-rimba rounded-full mb-5" />
              <h3
                className="font-semibold text-arang mb-1"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.15rem", fontStyle: "italic" }}
              >
                Yayasan Basamudera Budaya Teknologi
              </h3>
              <p className="text-[10px] font-medium tracking-wide uppercase text-rimba mb-3">
                Pengelola
              </p>
              <p className="text-sm text-teks-sekunder leading-relaxed" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
                Bilik Mapur dikelola oleh Yayasan Basamudera Budaya Teknologi — sebuah
                organisasi nirlaba yang berfokus pada pelestarian bahasa dan budaya daerah
                melalui pendekatan teknologi dan dokumentasi digital.
              </p>
            </div>

            {/* Badan Bahasa */}
            <div className="rounded-sm border-2 border-granit/30 p-6 bg-kapur">
              <div className="w-8 h-[3px] bg-beras-merah/60 rounded-full mb-5" />
              <h3
                className="font-semibold text-arang mb-1"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.15rem", fontStyle: "italic" }}
              >
                Badan Pengembangan dan Pembinaan Bahasa
              </h3>
              <p className="text-[10px] font-medium tracking-wide uppercase text-beras-merah mb-3">
                Didukung oleh
              </p>
              <p className="text-sm text-teks-sekunder leading-relaxed" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
                Proyek ini mendapat dukungan dari Badan Pengembangan dan Pembinaan Bahasa,
                Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia,
                dalam kerangka upaya pelestarian bahasa daerah secara nasional.
              </p>
            </div>
          </div>
        </section>

        {/* ── Pengambilan Data ── */}
        <section className="mb-16 pt-12 border-t-2 border-granit/30">
          <div className="grid lg:grid-cols-2 gap-12 items-stretch">
            {/* Kiri — teks */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-rimba mb-3">
                  Riset Lapangan
                </p>
                <h2
                  className="font-semibold text-arang mb-4 leading-tight"
                  style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "1.75rem",
                    fontStyle: "italic",
                  }}
                >
                  Pengambilan Data di<br />Dusun Aik Abik
                </h2>
                <div className="flex flex-col gap-3 text-sm leading-relaxed text-teks-sekunder" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
                  <p>
                    Data bahasa yang tersimpan dalam kamus ini dikumpulkan langsung dari penutur
                    asli di Dusun Aik Abik — jantung pemukiman komunitas adat Mapur di Pulau Bangka.
                    Pengambilan data dilakukan melalui sesi wawancara, rekaman tutur, dan pendokumentasian
                    kosakata bersama tetua dan penutur aktif.
                  </p>
                  <p>
                    Proses riset lapangan ini dilakukan bersama <span className="font-medium text-arang">Yayasan Gebong Mamarong</span> —
                    lembaga komunitas yang berakar langsung dari masyarakat Mapur dan selama ini
                    aktif menjaga kelangsungan adat dan bahasa mereka.
                  </p>
                </div>
              </div>

              {/* Mitra */}
              <div className="mt-auto p-4 rounded-sm border border-granit/30 bg-rumbia/50 flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded bg-rimba/10 flex items-center justify-center mt-0.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-rimba">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-arang mb-0.5">Yayasan Gebong Mamarong</p>
                  <p className="text-xs text-teks-sekunder leading-relaxed">
                    Mitra komunitas dalam riset dan pendokumentasian bahasa Mapur di lapangan.
                  </p>
                </div>
              </div>
            </div>

            {/* Kanan — wireframe foto lapangan */}
            <div
              className="relative flex-1 min-h-[260px] rounded-sm overflow-hidden border-2 border-dashed border-granit/40"
              style={{ background: "#E8E6E0" }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-40">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                  <rect x="4" y="4" width="32" height="32" rx="3" stroke="#33503C" strokeWidth="1.5" />
                  <circle cx="14" cy="15" r="4" stroke="#33503C" strokeWidth="1.5" />
                  <path d="M4 28 L12 20 L20 26 L28 18 L36 28" stroke="#33503C" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                <p className="text-[11px] font-medium tracking-wider uppercase text-center leading-relaxed" style={{ color: "#33503C" }}>
                  Foto Riset Lapangan<br />Dusun Aik Abik
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Kontak ── */}
        <section className="pt-12 border-t-2 border-granit/30">
          <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-rimba mb-3">
            Hubungi Kami
          </p>
          <h2
            className="font-semibold text-arang mb-2 leading-tight"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.75rem",
              fontStyle: "italic",
            }}
          >
            Ada pertanyaan?
          </h2>
          <p className="text-sm text-teks-sekunder mb-8 max-w-lg" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
            Untuk pertanyaan tentang proyek, kolaborasi riset, atau ingin berkontribusi
            lebih jauh — jangan ragu menghubungi kami.
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                ikon: (
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                ),
                ikonExtra: <polyline points="22,6 12,13 2,6" />,
                label: "Surel",
                nilai: "bilikmapur@basamudera.id",
                href: "mailto:bilikmapur@basamudera.id",
              },
              {
                ikon: (
                  <path d="M21 2H3v16h5l4 4 4-4h5V2z" />
                ),
                label: "Usulan & Kontribusi",
                nilai: "Form kontribusi kamus",
                href: "/usulan",
              },
              {
                ikon: (
                  <>
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </>
                ),
                label: "GitHub",
                nilai: "Kode sumber terbuka",
                href: "https://github.com",
              },
            ].map(({ ikon, ikonExtra, label, nilai, href }) => (
              <Link
                key={label}
                href={href}
                className="group flex items-start gap-4 p-5 rounded-sm border-2 border-granit/30 bg-kapur hover:border-rimba transition-colors"
              >
                <div className="shrink-0 w-9 h-9 rounded bg-rimba/8 flex items-center justify-center group-hover:bg-rimba/15 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-rimba">
                    {ikon}
                    {ikonExtra}
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-rimba mb-0.5">{label}</p>
                  <p className="text-sm text-arang group-hover:text-rimba transition-colors" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
                    {nilai}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
