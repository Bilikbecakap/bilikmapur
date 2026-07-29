"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/image/kegiatan/wawancara-pengambilan-data.jpeg",
    alt: "Wawancara pengambilan data",
  },
  {
    src: "/image/kegiatan/foto-bersama-nenek-anya.jpeg",
    alt: "Foto bersama Nenek Anya",
  },
  {
    src: "/image/kegiatan/foto-bersama-tim.jpeg",
    alt: "Foto bersama tim",
  },
  {
    src: "/image/kegiatan/pembuatan-video-edukasi.jpeg",
    alt: "Pembuatan video edukasi",
  },
  {
    src: "/image/kegiatan/poster-bilik-mapur.jpeg",
    alt: "Poster Bilik Mapur",
  },
];

export default function TentangSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div className="relative w-full aspect-[4/3] rounded-sm overflow-hidden border-2 border-granit/40">
        {slides.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={`object-cover transition-opacity duration-1000 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            priority={i === 0}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Tampilkan foto ${i + 1}: ${slide.alt}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-rimba" : "w-2 bg-granit/50 hover:bg-granit"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
