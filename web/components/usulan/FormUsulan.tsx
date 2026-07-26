"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import TurnstileWidget from "./TurnstileWidget";

interface Kategori {
  id: number;
  nama: string;
  slug: string;
}

interface EntryAwal {
  id: string;
  lema: string;
  kategori_slug: string | null;
  arti_indonesia: string;
  contoh_kalimat_mapur: string | null;
  contoh_kalimat_indonesia: string | null;
  catatan: string | null;
  sumber: string | null;
}

interface Props {
  aksi: "tambah" | "edit" | "hapus";
  kategoriList: Kategori[];
  entryAwal?: EntryAwal | null;
  siteKey: string;
}

type Status = "idle" | "loading" | "success" | "error";

const LABEL: Record<Props["aksi"], string> = {
  tambah: "Usulkan Kata Baru",
  edit: "Usulkan Koreksi",
  hapus: "Usulkan Penghapusan",
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-arang mb-1.5">
        {label}
        {required && <span className="text-beras-merah ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-granit/50 bg-kapur px-4 py-2.5 text-arang text-sm placeholder:text-granit/50 focus:border-kulit-kayu focus:outline-none focus:ring-2 focus:ring-kulit-kayu/15 transition-colors";

const textareaCls = inputCls + " resize-y min-h-[5rem]";

export default function FormUsulan({
  aksi,
  kategoriList,
  entryAwal,
  siteKey,
}: Props) {
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleToken = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!turnstileToken) {
      setErrorMsg("Selesaikan tantangan keamanan terlebih dahulu.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    formData.set("cf-turnstile-response", turnstileToken);

    try {
      const res = await fetch("/api/usulan", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.pesan ?? "Terjadi kesalahan. Coba lagi nanti.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Gagal mengirim usulan. Periksa koneksi internet Anda.");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-full bg-rimba/20 flex items-center justify-center mx-auto mb-5">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-rimba"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-arang mb-3">Usulan Terkirim</h2>
        <p className="text-teks-sekunder text-sm max-w-sm mx-auto mb-8">
          Terima kasih! Usulan Anda akan ditinjau oleh admin sebelum ditampilkan di kamus.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/kamus"
            className="px-5 py-2.5 rounded-lg bg-beras-merah text-kapur text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Kembali ke Kamus
          </Link>
          <button
            onClick={() => {
              setStatus("idle");
              setTurnstileToken("");
              formRef.current?.reset();
            }}
            className="px-5 py-2.5 rounded-lg border border-granit text-teks-sekunder text-sm hover:border-kulit-kayu hover:text-arang transition-colors"
          >
            Usulkan Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Honeypot */}
      <div
        style={{ position: "absolute", left: "-9999px", top: "-9999px", opacity: 0 }}
        aria-hidden="true"
      >
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <input type="hidden" name="aksi" value={aksi} />
      {entryAwal && <input type="hidden" name="target_entry_id" value={entryAwal.id} />}

      {/* Form hapus */}
      {aksi === "hapus" && entryAwal && (
        <>
          <div className="p-4 bg-rumbia rounded-lg border border-granit/30">
            <p className="text-xs font-medium text-teks-sekunder uppercase tracking-wider mb-1">
              Kata yang akan dihapus
            </p>
            <p className="istilah-mapur font-semibold text-lg">{entryAwal.lema}</p>
            <p className="text-teks-sekunder text-sm">{entryAwal.arti_indonesia}</p>
          </div>
          <Field label="Alasan Penghapusan" required>
            <textarea
              name="alasan"
              className={textareaCls}
              placeholder="Jelaskan mengapa kata ini perlu dihapus…"
              maxLength={500}
              required
            />
          </Field>
        </>
      )}

      {/* Form tambah / edit */}
      {(aksi === "tambah" || aksi === "edit") && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Kata Mapur" required>
              <input
                type="text"
                name="lema"
                className={inputCls}
                defaultValue={entryAwal?.lema ?? ""}
                placeholder="mis. cingkok purak"
                maxLength={200}
                required
              />
            </Field>
            <Field label="Kategori">
              <select
                name="kategori"
                className={inputCls}
                defaultValue={entryAwal?.kategori_slug ?? ""}
              >
                <option value="">— pilih opsional —</option>
                {kategoriList.map((k) => (
                  <option key={k.slug} value={k.slug}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Arti dalam Bahasa Indonesia" required>
            <textarea
              name="arti_indonesia"
              className={textareaCls}
              defaultValue={entryAwal?.arti_indonesia ?? ""}
              placeholder="Tuliskan arti kata ini…"
              maxLength={1000}
              required
            />
          </Field>

          <div className="space-y-4">
            <p className="text-xs font-medium text-teks-sekunder uppercase tracking-wider">
              Contoh Penggunaan <span className="normal-case font-normal">(opsional)</span>
            </p>
            <Field label="Contoh kalimat bahasa Mapur">
              <textarea
                name="contoh_kalimat_mapur"
                className={textareaCls}
                defaultValue={entryAwal?.contoh_kalimat_mapur ?? ""}
                placeholder="Tulis kalimat dalam bahasa Mapur…"
                maxLength={500}
              />
            </Field>
            <Field label="Terjemahan contoh (Indonesia)">
              <textarea
                name="contoh_kalimat_indonesia"
                className={textareaCls}
                defaultValue={entryAwal?.contoh_kalimat_indonesia ?? ""}
                placeholder="Terjemahan kalimat di atas…"
                maxLength={500}
              />
            </Field>
          </div>

          <Field label="Catatan">
            <textarea
              name="catatan"
              className={textareaCls}
              defaultValue={entryAwal?.catatan ?? ""}
              placeholder="Catatan pemakaian, konteks budaya, sumber penutur, atau informasi tambahan lainnya…"
              maxLength={500}
            />
          </Field>
        </>
      )}

      {/* Turnstile */}
      <div>
        <TurnstileWidget siteKey={siteKey} onToken={handleToken} />
      </div>

      {/* Error */}
      {status === "error" && errorMsg && (
        <p className="text-sm text-beras-merah bg-beras-merah/10 border border-beras-merah/30 rounded-lg px-4 py-3">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 rounded-lg bg-beras-merah text-kapur font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {status === "loading" ? "Mengirim…" : LABEL[aksi]}
      </button>

      <p className="text-xs text-teks-sekunder text-center">
        Semua usulan ditinjau admin sebelum ditampilkan. Data bahasa milik komunitas penutur.
      </p>
    </form>
  );
}
