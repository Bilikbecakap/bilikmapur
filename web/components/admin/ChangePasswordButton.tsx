"use client";

import { useState } from "react";

interface Props {
  userId: string;
  userEmail: string;
  formAction: (fd: FormData) => Promise<void>;
}

export default function ChangePasswordButton({ userId, userEmail, formAction }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-teks-sekunder hover:text-arang transition-colors"
      >
        Ganti pw
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl border border-granit/25 shadow-xl p-5 w-full max-w-sm">
            <h3 className="text-sm font-semibold text-arang mb-1">Ganti Password</h3>
            <p className="text-xs text-teks-sekunder mb-4">{userEmail}</p>
            <form
              action={async (fd) => {
                await formAction(fd);
                setOpen(false);
              }}
              className="space-y-3"
            >
              <input type="hidden" name="id" value={userId} />
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoFocus
                placeholder="Password baru (min. 6 karakter)"
                className="w-full px-3 py-2 rounded-lg border border-granit/30 text-sm text-arang focus:outline-none focus:border-arang"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-teks-sekunder hover:bg-kapur"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-arang text-kapur text-xs font-medium hover:opacity-90"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
