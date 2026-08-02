"use client";

import { useState } from "react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface Props {
  defaultJudul?: string;
  defaultSlug?: string;
}

export default function JudulSlugFields({ defaultJudul = "", defaultSlug = "" }: Props) {
  const [judul, setJudul] = useState(defaultJudul);
  const [slug, setSlug] = useState(defaultSlug);
  const [autoSync, setAutoSync] = useState(!defaultSlug);

  return (
    <>
      <div>
        <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Judul *</label>
        <input
          name="judul"
          required
          value={judul}
          onChange={(e) => {
            const v = e.target.value;
            setJudul(v);
            if (autoSync) setSlug(slugify(v));
          }}
          className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Slug URL *</label>
        <input
          name="slug"
          required
          placeholder="mis. tentang-bahasa-mapur"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setAutoSync(false);
          }}
          className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang font-mono focus:outline-none focus:border-arang"
        />
        <p className="text-[11px] text-teks-sekunder mt-1">
          {autoSync ? "Otomatis mengikuti judul — ubah manual jika perlu." : "Diisi manual."}
        </p>
      </div>
    </>
  );
}
