import Link from "next/link";

const jelajahi = [
  { href: "/", label: "Beranda" },
  { href: "/kamus", label: "Kamus" },
  { href: "/video", label: "Video" },
  { href: "/artikel", label: "Artikel" },
];

export default function Footer() {
  return (
    <footer className="mt-auto" style={{ background: "#1C2B21" }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-1">
            <p
              className="text-[1.6rem] font-semibold mb-3 tracking-tight"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontStyle: "italic",
                color: "#EAE9E9",
              }}
            >
              Bilik Mapur
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(234,233,233,0.55)" }}>
              Ikhtiar digitalisasi bahasa dan budaya masyarakat adat Mapur,
              Kabupaten Bangka. Sebuah ruang untuk merawat yang lisan agar tak hilang.
            </p>
          </div>

          {/* Jelajahi */}
          <div>
            <p
              className="text-[9px] font-semibold uppercase tracking-[0.2em] mb-4"
              style={{ color: "rgba(234,233,233,0.3)" }}
            >
              Jelajah
            </p>
            <div className="flex flex-col gap-2.5">
              {jelajahi.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm transition-colors hover:text-beras-merah"
                  style={{ color: "rgba(234,233,233,0.6)" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Kontribusi */}
          <div>
            <p
              className="text-[9px] font-semibold uppercase tracking-[0.2em] mb-4"
              style={{ color: "rgba(234,233,233,0.3)" }}
            >
              Kontribusi
            </p>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(234,233,233,0.55)" }}>
              Punya kosakata, cerita, atau rekaman? Bantu lengkapi arsip ini bersama komunitas.
            </p>
            <Link
              href="/usulan"
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ background: "var(--kapur)", color: "var(--rimba)" }}
            >
              Sumbang Data
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div
          className="pt-6 text-xs text-center"
          style={{ borderTop: "1px solid rgba(234,233,233,0.08)", color: "rgba(234,233,233,0.25)" }}
        >
          © {new Date().getFullYear()} Bilik Mapur · Digitalisasi Bahasa Daerah
        </div>
      </div>
    </footer>
  );
}
