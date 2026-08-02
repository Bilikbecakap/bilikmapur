"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Email atau kata sandi salah.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16 bg-kapur">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1
              className="font-semibold text-arang mb-2 leading-tight"
              style={{
                fontFamily: "var(--font-baloo), Georgia, sans-serif",
                fontSize: "2.5rem",
                fontStyle: "italic",
              }}
            >
              Masuk
            </h1>
            <p className="text-sm text-teks-sekunder" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
              Akses panel pengelolaan Bilik Mapur.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-sm border-2 border-granit/30 bg-white p-7"
          >
            {error && (
              <div className="mb-5 px-4 py-3 rounded bg-beras-merah/8 text-beras-merah text-sm border border-beras-merah/20">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-teks-sekunder mb-1.5">
                  Alamat email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded border border-granit/35 bg-kapur/40 text-arang text-sm placeholder-granit/50 focus:outline-none focus:border-rimba transition-colors"
                  placeholder="nama@domain.com"
                  style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-teks-sekunder mb-1.5">
                  Kata sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pr-11 rounded border border-granit/35 bg-kapur/40 text-arang text-sm placeholder-granit/50 focus:outline-none focus:border-rimba transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-granit/60 hover:text-rimba transition-colors"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-10-8-10-8a18.6 18.6 0 015.06-5.94M9.9 4.24A10.4 10.4 0 0112 4c7 0 10 8 10 8a18.6 18.6 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded bg-rimba text-kapur text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 mt-1"
                style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-teks-sekunder mt-6">
            Butuh bantuan?{" "}
            <a href="/tentang#hubungi-kami" className="text-rimba hover:underline">
              Hubungi pengelola
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
