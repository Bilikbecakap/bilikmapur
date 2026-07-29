"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/image/rumah-adat-mapur-gebong-memarong.jpeg",
    alt: "Rumah adat Mapur, Gebong Memarong",
    caption: "Gebong Memarong · Rumah Adat",
  },
  {
    src: "/image/prosesi-upacara-adat-nujuh-jerami.jpeg",
    alt: "Prosesi upacara adat Nujuh Jerami",
    caption: "Nujuh Jerami · Upacara Adat",
  },
];

export default function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <div className="absolute -bottom-4 -right-4 w-full h-full rounded-sm bg-beras-merah/25" />
      <div className="absolute -bottom-2 -right-2 w-full h-full rounded-sm border-2 border-rimba/30" />
      <div className="relative w-full aspect-[4/3] rounded-sm overflow-hidden border-2 border-granit/40 shadow-lg">
        {slides.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="50vw"
            className={`object-cover transition-opacity duration-1000 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            priority={i === 0}
          />
        ))}
      </div>
      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-sm bg-kapur/90 backdrop-blur-sm border border-granit/30 px-3 py-2 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-beras-merah shrink-0" />
        <p
          className="text-xs text-arang leading-none"
          style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
        >
          {slides[index].caption}
        </p>
      </div>
    </div>
  );
}
