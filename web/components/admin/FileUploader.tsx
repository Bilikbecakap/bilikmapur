"use client";

import { useState } from "react";
import { fileUrl } from "@/lib/file-url";

interface Props {
  name: string;
  currentKey?: string;
  subfolder?: string;
  accept?: string;
}

export default function FileUploader({ name, currentKey = "", subfolder, accept = "*/*" }: Props) {
  const [key, setKey] = useState(currentKey);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const url = fileUrl(key);
  const isImage = accept.includes("image");
  const isAudio = accept.includes("audio");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");

    const form = new FormData();
    form.append("file", file);
    if (subfolder) form.append("subfolder", subfolder);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? "Upload gagal.");
      return;
    }
    setKey(data.key);
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={key} />

      {url && isImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-32 h-32 object-cover rounded-lg border border-granit/25" />
      )}
      {url && isAudio && (
        <audio controls src={url} className="w-full" />
      )}
      {url && !isImage && !isAudio && (
        <a href={url} target="_blank" rel="noreferrer" className="text-xs text-beras-merah underline">
          File saat ini: {key}
        </a>
      )}

      <div className="flex items-center gap-3">
        <label className="cursor-pointer px-3 py-2 rounded-lg border border-granit/40 bg-kapur/50 text-xs text-teks-sekunder hover:border-arang hover:text-arang transition-colors">
          {uploading ? "Mengunggah..." : key ? "Ganti file" : "Pilih file"}
          <input type="file" accept={accept} onChange={handleChange} className="hidden" disabled={uploading} />
        </label>
        {key && (
          <button
            type="button"
            onClick={() => setKey("")}
            className="text-xs text-beras-merah/60 hover:text-beras-merah transition-colors"
          >
            Hapus
          </button>
        )}
      </div>

      {error && <p className="text-xs text-beras-merah">{error}</p>}
      {key && <p className="text-[11px] text-teks-sekunder break-all">{key}</p>}
    </div>
  );
}
