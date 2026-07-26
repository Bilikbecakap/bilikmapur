"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  defaultValue?: string;
  kategoriSlug?: string;
}

export default function CariInput({ defaultValue = "", kategoriSlug = "" }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  function navigate(val: string) {
    const params = new URLSearchParams();
    if (val.trim()) params.set("q", val.trim());
    if (kategoriSlug) params.set("kategori", kategoriSlug);
    router.push(`/kamus?${params.toString()}`);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setValue(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => navigate(val), 400);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    navigate(value);
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Cari kata Mapur atau artinya dalam bahasa Indonesia…"
        autoComplete="off"
        className="w-full rounded-xl border border-granit/50 bg-kapur px-5 py-4 pr-14 text-arang text-base placeholder:text-granit/50 focus:border-kulit-kayu focus:outline-none focus:ring-2 focus:ring-kulit-kayu/15 transition-colors"
      />
      <button
        type="submit"
        aria-label="Cari"
        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg bg-beras-merah/10 text-beras-merah hover:bg-beras-merah hover:text-kapur transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    </form>
  );
}
