import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import HeroSlideshow from "@/components/HeroSlideshow";

export const metadata: Metadata = {
  title: "Bilik Mapur — Digitalisasi Bahasa Daerah",
  description:
    "Ruang digital untuk mempelajari, mendokumentasikan, dan mewariskan bahasa serta budaya masyarakat adat Mapur, Pulau Bangka.",
};

export default function Beranda() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-kapur border-b-2 border-granit/30">
        {/* Ornamen busur — sudut kiri atas */}
        <svg
          className="absolute -top-16 -left-16 pointer-events-none select-none hidden sm:block"
          width="280"
          height="280"
          viewBox="0 0 280 280"
          fill="none"
          aria-hidden="true"
        >
          {[40, 65, 90, 115, 140, 165, 190, 215, 245, 278].map((r, i) => (
            <path
              key={r}
              d={`M ${280 - r} 280 A ${r} ${r} 0 0 1 280 ${280 - r}`}
              stroke="#33503C"
              strokeWidth="1"
              fill="none"
              opacity={Math.max(0.03, 0.14 - i * 0.011)}
            />
          ))}
        </svg>

        {/* Kilau lembut di belakang foto */}
        <div
          className="absolute top-1/2 right-0 -translate-y-1/2 -z-0 hidden lg:block pointer-events-none select-none"
          style={{
            width: "620px",
            height: "620px",
            transform: "translate(20%, -50%)",
            background:
              "radial-gradient(circle, rgba(182,130,53,0.16) 0%, rgba(182,130,53,0.05) 45%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Teks */}
            <div>
              {/* Overline */}
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-rimba mb-8">
                Pulau Bangka · Kaki Gunung Maras
              </p>

              <h1
                className="font-semibold leading-[1.08] mb-6 text-arang"
                style={{
                  fontFamily: "var(--font-baloo), Georgia, sans-serif",
                  fontSize: "clamp(2.625rem, 5.25vw, 4.375rem)",
                  fontStyle: "italic",
                }}
              >
                Merawat tutur<br />
                orang <span className="istilah-mapur">Mapur</span>.
              </h1>

              <p className="text-base leading-relaxed text-teks-sekunder mb-10 max-w-lg" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
                Ruang digital untuk mempelajari, mendokumentasikan, dan mewariskan
                bahasa serta budaya masyarakat adat Mapur — dari kosakata sehari-hari
                hingga adat yang dituturkan turun-temurun.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/kamus"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-medium shadow-sm transition-all hover:opacity-90 hover:shadow-md"
                  style={{ background: "var(--rimba)", color: "#F3F2F2", fontFamily: "var(--font-lora), Georgia, serif" }}
                >
                  Buka Kamus Digital
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Sisi kanan — foto */}
            <div className="hidden lg:block">
              <HeroSlideshow />
            </div>
          </div>
        </div>
      </section>

      {/* ── Jelajahi Bilik Mapur ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "rgba(51,80,60,0.08)" }}
      >
        {/* Ornamen sudut kanan atas */}
        <svg
          className="absolute top-0 right-0 pointer-events-none select-none"
          width="260"
          height="260"
          viewBox="0 0 260 260"
          fill="none"
          aria-hidden="true"
        >
          {[30, 55, 80, 105, 130, 155, 180, 205, 235, 258].map((r, i) => (
            <path
              key={r}
              d={`M ${260 - r} 0 A ${r} ${r} 0 0 1 260 ${r}`}
              stroke="#33503C"
              strokeWidth="1"
              fill="none"
              opacity={Math.max(0.03, 0.16 - i * 0.013)}
            />
          ))}
        </svg>

        {/* Ornamen sudut kiri bawah */}
        <svg
          className="absolute bottom-0 left-0 pointer-events-none select-none"
          width="260"
          height="260"
          viewBox="0 0 260 260"
          fill="none"
          aria-hidden="true"
        >
          {[30, 55, 80, 105, 130, 155, 180, 205, 235, 258].map((r, i) => (
            <path
              key={r}
              d={`M ${r} 260 A ${r} ${r} 0 0 0 0 ${260 - r}`}
              stroke="#33503C"
              strokeWidth="1"
              fill="none"
              opacity={Math.max(0.03, 0.16 - i * 0.013)}
            />
          ))}
        </svg>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-baseline justify-between mb-10">
            <div>
              <h2
                className="font-semibold text-arang leading-tight"
                style={{
                  fontFamily: "var(--font-baloo), Georgia, sans-serif",
                  fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                  fontStyle: "italic",
                }}
              >
                Jelajahi Bilik Mapur
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                href: "/kamus",
                label: "Kamus",
                cta: "Buka kamus",
                desc: "Cari padanan kata, dengarkan pelafalan, dan pelajari contoh kalimat.",
              },
              {
                href: "/video",
                label: "Video",
                cta: "Lihat galeri",
                desc: "Tonton adat, tarian, musik, dan keseharian masyarakat Mapur.",
              },
              {
                href: "/artikel",
                label: "Artikel",
                cta: "Baca artikel",
                desc: "Baca catatan tentang bahasa, adat, sejarah, dan pelestarian.",
              },
              {
                href: "/modul",
                label: "Modul",
                cta: "Buka modul",
                desc: "Unduh buku dan materi belajar budaya Mapur dalam format PDF.",
              },
            ].map(({ href, label, cta, desc }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col p-7 rounded-sm border-2 border-granit/40 hover:border-rimba hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 bg-kapur"
              >
                <div className="w-6 h-[3px] mb-5 rounded-full bg-rimba/40 group-hover:bg-rimba transition-colors" />
                <h3
                  className="font-semibold text-arang mb-3 transition-colors group-hover:text-rimba"
                  style={{
                    fontFamily: "var(--font-baloo), Georgia, sans-serif",
                    fontSize: "1.5rem",
                    fontStyle: "italic",
                  }}
                >
                  {label}
                </h3>
                <p className="text-sm leading-relaxed text-teks-sekunder flex-1" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
                  {desc}
                </p>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-medium transition-colors" style={{ color: "var(--rimba)" }}>
                  <span>{cta}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="translate-x-0 group-hover:translate-x-0.5 transition-transform">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tentang Bahasa ── */}
      <section className="bg-kapur border-b-2 border-granit/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-14 items-stretch">
            {/* Kiri — judul + ringkasan + wireframe gambar */}
            <div className="flex flex-col gap-6">
              <div>
                <h2
                  className="font-semibold text-arang mb-4 leading-tight"
                  style={{
                    fontFamily: "var(--font-baloo), Georgia, sans-serif",
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    fontStyle: "italic",
                  }}
                >
                  Bahasa Mapur
                </h2>
                <p className="text-sm leading-relaxed text-teks-sekunder" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
                  Dituturkan oleh masyarakat adat Mapur di kawasan Gunung Maras, Kabupaten Bangka.
                  Sebuah warisan lisan yang kini semakin jarang terdengar di lidah generasi muda.
                </p>
              </div>

              {/* Foto komunitas */}
              <div className="relative flex-1 min-h-[180px] rounded-sm overflow-hidden border-2 border-granit/40">
                <Image
                  src="/image/orang-mapur.jpeg"
                  alt="Komunitas Mapur bersama tim dokumentasi"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Kanan — paragraf dengan drop cap, rata tengah justify */}
            <div>
              <p
                className="drop-cap text-[0.95rem] leading-[1.85] text-arang text-justify"
                style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
              >
                Bahasa Mapur adalah bahasa yang dituturkan oleh komunitas adat Mapur,
                yang secara turun-temurun mendiami kaki Gunung Maras di Pulau Bangka.
                Sebagai bagian dari rumpun bahasa Melayik, ia berkerabat erat dengan
                Melayu Bangka, namun menyimpan kosakata, pelafalan, dan ungkapan khas
                yang membedakannya dan mencerminkan hubungan erat masyarakatnya dengan
                alam sekitar.
              </p>
              <p
                className="text-[0.95rem] leading-[1.85] text-arang mt-5 text-justify"
                style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
              >
                Seperti banyak bahasa daerah lain di Nusantara, Bahasa Mapur menghadapi
                tekanan pergeseran bahasa: penuturnya menua, sementara anak muda kian
                jarang menggunakannya sehari-hari. Digitalisasi menjadi salah satu ikhtiar
                untuk merekam, membakukan, dan membuka kembali akses terhadap bahasa ini
                bagi siapa pun yang ingin belajar.
              </p>
            </div>
          </div>

          {/* Kartu sejarah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-10 border-t-2 border-granit/30">
            {[
              {
                label: "ASAL-USUL",
                judul: "Sejarah",
                desc: "Masyarakat adat yang turun-temurun mendiami kaki Gunung Maras di Pulau Bangka.",
              },
              {
                label: "SEBARAN",
                judul: "Penutur",
                desc: "Terpusat di kawasan Air Abik; jumlah penutur aktif terus menyusut tiap generasi.",
              },
              {
                label: "KERABAT",
                judul: "Melayu Bangka",
                desc: "Bagian dari rumpun Melayik, dekat namun berbeda dengan Melayu Bangka.",
              },
              {
                label: "KONDISI",
                judul: "Pelestarian",
                desc: "Tergolong terancam; digitalisasi menjadi salah satu upaya perekaman.",
              },
            ].map(({ label, judul, desc }) => (
              <div key={label} className="border-t-[3px] border-rimba/40 pt-4">
                <p
                  className="font-semibold text-arang mb-2"
                  style={{ fontFamily: "var(--font-baloo), Georgia, sans-serif", fontSize: "1.1rem", fontStyle: "italic" }}
                >
                  {judul}
                </p>
                <p className="text-xs leading-relaxed text-teks-sekunder">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Kontribusi ── */}
      <section className="bg-rumbia border-t border-granit/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Kiri — teks */}
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-rimba mb-4">
                Ikut Melestarikan
              </p>
              <h2
                className="font-semibold leading-tight mb-5 text-arang"
                style={{
                  fontFamily: "var(--font-baloo), Georgia, sans-serif",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontStyle: "italic",
                }}
              >
                Bahasa ini milik<br />kita bersama.
              </h2>
              <p className="text-sm leading-relaxed mb-8 text-teks-sekunder" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
                Setiap kosakata, kalimat, dan cerita yang kamu bagikan membantu menjaga
                bahasa Mapur tetap hidup untuk generasi berikutnya.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/usulan"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-medium transition-opacity hover:opacity-90 bg-rimba text-kapur"
                  style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
                >
                  Sumbang Data
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/kamus"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm border-2 transition-colors hover:border-rimba hover:text-rimba"
                  style={{ borderColor: "var(--granit)", color: "var(--teks-sekunder)", fontFamily: "var(--font-lora), Georgia, serif" }}
                >
                  Lihat Kamus
                </Link>
              </div>
            </div>

            {/* Kanan — 3 poin kontribusi */}
            <div className="flex flex-col gap-5">
              {[
                {
                  icon: (
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                  ),
                  judul: "Usulkan Kosakata",
                  desc: "Tambah atau perbaiki lema yang belum ada di kamus digital.",
                },
                {
                  icon: (
                    <>
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                    </>
                  ),
                  judul: "Bagikan Rekaman",
                  desc: "Rekaman suara penutur asli adalah aset paling berharga.",
                },
                {
                  icon: (
                    <>
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </>
                  ),
                  judul: "Kirim Cerita",
                  desc: "Legenda, pepatah, atau kisah sehari-hari dalam bahasa Mapur.",
                },
              ].map(({ icon, judul, desc }) => (
                <div key={judul} className="flex items-start gap-4">
                  <div className="shrink-0 w-9 h-9 rounded flex items-center justify-center bg-rimba/10">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-rimba">
                      {icon}
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-0.5 text-arang" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
                      {judul}
                    </p>
                    <p className="text-xs leading-relaxed text-teks-sekunder">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
