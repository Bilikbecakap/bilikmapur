"use client";

import { forwardRef, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface KategoriItem { id: number; nama: string }

interface EntryData {
  id: string;
  lema: string;
  arti_indonesia: string;
  contoh_kalimat_mapur: string | null;
  contoh_kalimat_indonesia: string | null;
  pelafalan_ipa: string | null;
  catatan: string | null;
  sumber: string | null;
  status: string;
  kategori_id: number | null;
}

interface Props {
  entryId: string;
  variant?: "icon" | "button";
}

export default function EditLemaButton({ entryId, variant = "icon" }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entry, setEntry] = useState<EntryData | null>(null);
  const [kategoriList, setKategoriList] = useState<KategoriItem[]>([]);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);

  async function openModal() {
    setOpen(true);
    setError("");
    setDirty(false);
    if (entry) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/kamus/${entryId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEntry(data.entry);
      setKategoriList(data.kategoriList);
    } catch {
      setError("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setOpen(false);
    if (dirty) router.refresh();
  }

  useEffect(() => {
    if (open && !loading && entry) firstRef.current?.focus();
  }, [open, loading, entry]);

  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, dirty]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/kamus/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(
          [...fd.entries()].map(([k, v]) => [k, (v as string).trim() || null])
        )),
      });
      if (!res.ok) throw new Error();
      setDirty(true);
      // Perbarui cache lokal agar modal tidak stale jika dibuka lagi
      const updated: Partial<EntryData> = {};
      fd.forEach((v, k) => { (updated as Record<string, unknown>)[k] = (v as string).trim() || null; });
      setEntry(prev => prev ? { ...prev, ...updated } : prev);
      close();
    } catch {
      setError("Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {variant === "icon" ? (
        <button onClick={openModal} title="Edit lema"
          className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-rimba/10 text-granit/40 hover:text-rimba transition-colors">
          <Pensil />
        </button>
      ) : (
        <button onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rimba text-kapur text-sm font-medium hover:opacity-90 transition-opacity">
          <Pensil />
          Edit Lema
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="flex-1 bg-black/30 backdrop-blur-[1px]" onClick={close} />

          {/* Drawer */}
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/8 shrink-0">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-rimba mb-0.5">Edit Lema</p>
                <h2 className="text-base font-semibold text-arang">
                  {entry ? <em className="not-italic italic text-kulit-kayu">{entry.lema}</em> : "Memuat…"}
                </h2>
              </div>
              <button onClick={close} aria-label="Tutup"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-black/30 hover:text-black hover:bg-black/6 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center h-full gap-3 flex-col">
                  <div className="w-5 h-5 border-2 border-rimba/25 border-t-rimba rounded-full animate-spin" />
                  <p className="text-sm text-teks-sekunder">Memuat…</p>
                </div>
              )}

              {!loading && error && !entry && (
                <div className="flex items-center justify-center h-full flex-col gap-2">
                  <p className="text-sm text-beras-merah">{error}</p>
                  <button onClick={() => { setEntry(null); openModal(); }} className="text-xs underline text-teks-sekunder">Coba lagi</button>
                </div>
              )}

              {!loading && entry && (
                <form id="edit-lema-form" onSubmit={onSubmit} className="px-6 py-5 space-y-4">

                  <F ref={firstRef} label="Kata Mapur" name="lema" defaultValue={entry.lema} required
                    inputClass="font-medium italic text-kulit-kayu" />

                  <F label="Arti dalam Bahasa Indonesia" name="arti_indonesia" defaultValue={entry.arti_indonesia} required />

                  <div>
                    <label className={lbl}>Kategori</label>
                    <select name="kategori_id" defaultValue={entry.kategori_id ?? ""} className={sel}>
                      <option value="">— Tanpa kategori —</option>
                      {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                    </select>
                  </div>

                  <hr className="border-black/6" />

                  <p className="text-[10px] font-semibold uppercase tracking-widest text-teks-sekunder">Contoh Kalimat</p>
                  <TA label="Versi Mapur" name="contoh_kalimat_mapur" defaultValue={entry.contoh_kalimat_mapur ?? ""} />
                  <TA label="Terjemahan Indonesia" name="contoh_kalimat_indonesia" defaultValue={entry.contoh_kalimat_indonesia ?? ""} />

                  <hr className="border-black/6" />

                  <p className="text-[10px] font-semibold uppercase tracking-widest text-teks-sekunder">Info Tambahan</p>
                  <F label="Pelafalan IPA" name="pelafalan_ipa" defaultValue={entry.pelafalan_ipa ?? ""} />
                  <TA label="Catatan pemakaian" name="catatan" defaultValue={entry.catatan ?? ""} />
                  <F label="Sumber / atribusi" name="sumber" defaultValue={entry.sumber ?? ""} />

                  <div>
                    <label className={lbl}>Status</label>
                    <select name="status" defaultValue={entry.status} className={sel}>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  {error && (
                    <p className="text-xs text-beras-merah bg-beras-merah/8 px-3 py-2 rounded-lg">{error}</p>
                  )}
                </form>
              )}
            </div>

            {/* Footer */}
            {!loading && entry && (
              <div className="shrink-0 px-6 py-4 border-t border-black/8 bg-[#FAFAF9] flex items-center justify-between">
                <p className="text-[11px] text-black/30">Esc untuk menutup</p>
                <div className="flex gap-2">
                  <button type="button" onClick={close}
                    className="px-4 py-2 rounded-lg border border-black/15 text-sm text-teks-sekunder hover:border-black/30 hover:text-arang transition-colors">
                    Batal
                  </button>
                  <button type="submit" form="edit-lema-form" disabled={saving}
                    className="px-5 py-2 rounded-lg bg-rimba text-kapur text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 min-w-[80px] flex items-center justify-center gap-2">
                    {saving
                      ? <><span className="w-3.5 h-3.5 border border-kapur/40 border-t-kapur rounded-full animate-spin" />Simpan…</>
                      : "Simpan"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Pensil() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

const lbl = "block text-xs font-medium text-teks-sekunder mb-1.5";
const inp = "w-full px-3 py-2.5 rounded-lg border border-black/15 bg-white text-sm text-arang focus:outline-none focus:border-rimba focus:ring-2 focus:ring-rimba/15 transition-colors";
const sel = `${inp} cursor-pointer`;

const F = forwardRef<HTMLInputElement, {
  label: string; name: string; defaultValue?: string; required?: boolean; inputClass?: string;
}>(function F({ label, name, defaultValue, required, inputClass }, ref) {
  return (
    <div>
      <label className={lbl}>{label}{required && <span className="text-beras-merah ml-0.5">*</span>}</label>
      <input ref={ref} name={name} defaultValue={defaultValue} required={required}
        className={`${inp} ${inputClass ?? ""}`} />
    </div>
  );
});

function TA({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      <textarea name={name} defaultValue={defaultValue} rows={3}
        className={`${inp} resize-none`} />
    </div>
  );
}
