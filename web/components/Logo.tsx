import Link from "next/link";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex flex-col leading-none group">
      <span
        className="font-semibold tracking-tight transition-colors"
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontStyle: "italic",
          fontSize: "1.35rem",
          color: light ? "#F3F2F2" : "var(--arang)",
        }}
      >
        Bilik Mapur
      </span>
      <span
        className="text-[9px] font-medium tracking-[0.18em] uppercase"
        style={{ color: light ? "rgba(243,242,242,0.55)" : "var(--teks-sekunder)" }}
      >
        Digitalisasi Bahasa Daerah
      </span>
    </Link>
  );
}
