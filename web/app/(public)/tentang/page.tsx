import type { Metadata } from "next";
import Link from "next/link";
import TentangSlideshow from "@/components/TentangSlideshow";

export const metadata: Metadata = {
  title: "Tentang — Bilik Mapur",
  description:
    "Tentang proyek digitalisasi bahasa Mapur — bahasa daerah masyarakat adat Pulau Bangka, dikelola Yayasan Basamudera Budaya Teknologi Indonesia bersama komunitas.",
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
              fontFamily: "var(--font-baloo), Georgia, sans-serif",
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

        {/* ── Dibalik Proyek & Riset Lapangan ── */}
        <section className="mb-16">
          <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-rimba mb-3">
            Penyelenggara & Riset Lapangan
          </p>
          <h2
            className="font-semibold text-arang mb-6 leading-tight"
            style={{
              fontFamily: "var(--font-baloo), Georgia, sans-serif",
              fontSize: "1.75rem",
              fontStyle: "italic",
            }}
          >
            Di balik Bilik Mapur
          </h2>

          <div className="grid lg:grid-cols-2 gap-12 items-start mb-10">
            {/* Kiri — teks */}
            <div className="flex flex-col gap-4 text-base leading-relaxed text-teks-sekunder" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
              <p>
                <span className="istilah-mapur">Bahasa Mapur</span> adalah bahasa daerah yang
                dituturkan oleh masyarakat adat Mapur di kawasan Gunung Maras, Kabupaten Bangka.
                Termasuk rumpun Austronesia cabang Melayik, bahasa ini menyimpan kosakata dan
                ungkapan khas yang mencerminkan kedekatan komunitasnya dengan alam. Penuturnya
                kian menua dan generasi muda semakin jarang menggunakannya — menjadikannya
                warisan lisan yang perlu segera didokumentasikan.
              </p>
              <p>
                Bilik Mapur hadir untuk merekam, membakukan, dan membuka akses bahasa ini bagi
                siapa pun yang ingin mempelajarinya. Digagas dan dikelola oleh{" "}
                <span className="text-arang font-semibold">Yayasan Basamudera Budaya Teknologi Indonesia</span>,
                bersama <span className="text-arang font-semibold">Yayasan Gebong Memarong</span> yang
                riset langsung di Dusun Aik Abik melalui wawancara dan pendokumentasian kosakata
                bersama penutur asli, dengan dukungan{" "}
                <span className="text-arang font-semibold">Badan Pengembangan dan Pembinaan Bahasa</span>.
              </p>
            </div>

            {/* Kanan — foto bergantian */}
            <TentangSlideshow />
          </div>

          {/* Garis kredit penyelenggara & mitra */}
          <div className="grid sm:grid-cols-3 border-y-2 border-granit/30">
            <div className="py-5 sm:pr-6 border-b sm:border-b-0 sm:border-r border-granit/30">
              <div className="w-6 h-[3px] bg-rimba rounded-full mb-3" />
              <p className="text-[9px] font-semibold tracking-[0.15em] uppercase text-rimba mb-1.5">
                Pelopor & Pengelola
              </p>
              <p className="text-sm font-medium text-arang leading-snug">
                Yayasan Basamudera Budaya Teknologi
              </p>
            </div>
            <div className="py-5 sm:px-6 border-b sm:border-b-0 sm:border-r border-granit/30">
              <div className="w-6 h-[3px] bg-kulit-kayu rounded-full mb-3" />
              <p className="text-[9px] font-semibold tracking-[0.15em] uppercase text-kulit-kayu mb-1.5">
                Mitra Riset Lapangan
              </p>
              <p className="text-sm font-medium text-arang leading-snug">
                Yayasan Gebong Memarong
              </p>
            </div>
            <div className="pt-5 sm:pl-6">
              <div className="w-6 h-[3px] bg-beras-merah rounded-full mb-3" />
              <p className="text-[9px] font-semibold tracking-[0.15em] uppercase text-beras-merah mb-1.5">
                Dukungan
              </p>
              <p className="text-sm font-medium text-arang leading-snug">
                Badan Pengembangan dan Pembinaan Bahasa
              </p>
            </div>
          </div>
        </section>

        {/* ── Kontak ── */}
        <section id="hubungi-kami" className="pt-12 border-t-2 border-granit/30">
          <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-rimba mb-3">
            Hubungi Kami
          </p>
          <h2
            className="font-semibold text-arang mb-2 leading-tight"
            style={{
              fontFamily: "var(--font-baloo), Georgia, sans-serif",
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                ikon: (
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                ),
                ikonExtra: <polyline points="22,6 12,13 2,6" />,
                label: "Surel",
                nilai: "yayasanbasamudera.indonesia@gmail.com",
                href: "mailto:yayasanbasamudera.indonesia@gmail.com",
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
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  </>
                ),
                ikonExtra: <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />,
                label: "Instagram",
                nilai: "@basamudera.id",
                href: "https://www.instagram.com/basamudera.id/",
              },
              {
                ikon: (
                  <>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 010 20 15.3 15.3 0 010-20z" />
                  </>
                ),
                label: "Website Yayasan",
                nilai: "basamudera.or.id",
                href: "https://basamudera.or.id/",
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
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-rimba mb-0.5">{label}</p>
                  <p className="text-sm text-arang group-hover:text-rimba transition-colors break-words" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
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
