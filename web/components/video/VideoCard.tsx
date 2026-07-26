"use client";

import { useState } from "react";

interface Props {
  judul: string;
  deskripsi: string | null;
  youtube_id: string;
}

export default function VideoCard({ judul, deskripsi, youtube_id }: Props) {
  const [loaded, setLoaded] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${youtube_id}/mqdefault.jpg`;

  return (
    <div className="rounded-xl overflow-hidden border border-granit/30 hover:border-granit/60 hover:shadow-sm transition-all group/card">
      {/* Video area */}
      <div className="relative aspect-video bg-rumbia/60">
        {loaded ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtube_id}?autoplay=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={judul}
          />
        ) : (
          <button
            onClick={() => setLoaded(true)}
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
        )}
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
    </div>
  );
}
