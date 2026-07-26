"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";

interface KategoriItem {
  slug: string;
  nama: string;
  href: string;
}

interface Props {
  items: KategoriItem[];
  semuaHref: string;
  aktif: string;
}

export default function KategoriScroll({ items, semuaHref, aktif }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  function update() {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  function scroll(dir: "left" | "right") {
    ref.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  }

  const btnBase =
    "absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-white border border-granit/40 shadow-sm text-teks-sekunder hover:text-rimba hover:border-rimba transition-all";

  return (
    <div className="relative mb-5">
      {/* Panah kiri */}
      {canLeft && (
        <button
          onClick={() => scroll("left")}
          aria-label="Geser kiri"
          className={`${btnBase} -left-3`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Daftar kategori */}
      <div
        ref={ref}
        className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Link
          href={semuaHref}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !aktif
              ? "bg-rimba text-kapur border-rimba"
              : "border-granit/50 text-teks-sekunder hover:border-rimba hover:text-rimba"
          }`}
        >
          Semua
        </Link>
        {items.map((kat) => (
          <Link
            key={kat.slug}
            href={kat.href}
            className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              aktif === kat.slug
                ? "bg-rimba text-kapur border-rimba"
                : "border-granit/50 text-teks-sekunder hover:border-rimba hover:text-rimba"
            }`}
          >
            {kat.nama}
          </Link>
        ))}
      </div>

      {/* Panah kanan */}
      {canRight && (
        <button
          onClick={() => scroll("right")}
          aria-label="Geser kanan"
          className={`${btnBase} -right-3`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
