"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  judul: string;
  deskripsi: string | null;
  youtube_id: string;
}

export default function VideoCard({ judul, deskripsi, youtube_id }: Props) {
  const [open, setOpen] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${youtube_id}/mqdefault.jpg`;

  return (
    <div className="rounded-xl overflow-hidden border border-granit/30 hover:border-granit/60 hover:shadow-sm transition-all group/card">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-rumbia/60">
        <button
          onClick={() => setOpen(true)}
          className="w-full h-full relative cursor-pointer"
          aria-label={`Putar video: ${judul}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt={judul}
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-arang/25 group-hover/card:bg-arang/35 transition-colors">
            <div className="w-12 h-12 rounded-full bg-beras-merah flex items-center justify-center shadow-lg scale-95 group-hover/card:scale-100 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-kapur ml-0.5">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Metadata */}
      <div className="p-4 bg-kapur">
        <h2 className="font-semibold text-arang text-sm leading-snug mb-1.5 line-clamp-2 group-hover/card:text-beras-merah transition-colors">
          {judul}
        </h2>
        {deskripsi && (
          <p className="text-teks-sekunder text-xs line-clamp-2 leading-relaxed">
            {deskripsi}
          </p>
        )}
      </div>

      {open && (
        <VideoModal
          judul={judul}
          deskripsi={deskripsi}
          youtube_id={youtube_id}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function VideoModal({
  judul,
  deskripsi,
  youtube_id,
  onClose,
}: Props & { onClose: () => void }) {
  // Tutup dengan Escape + kunci scroll halaman selama modal terbuka
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={judul}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-arang/80 p-4 sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl"
      >
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            autoFocus
            aria-label="Tutup video"
            className="w-9 h-9 rounded-full bg-kapur/15 hover:bg-kapur/25 text-kapur flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-arang shadow-2xl">
          <iframe
            src={`https://www.youtube.com/embed/${youtube_id}?autoplay=1&rel=0`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={judul}
          />
        </div>
        <div className="mt-3 text-kapur">
          <h2 className="font-semibold leading-snug">{judul}</h2>
          {deskripsi && (
            <p className="mt-1 text-sm text-kapur/80 leading-relaxed">{deskripsi}</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
