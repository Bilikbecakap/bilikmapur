"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MasukPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded border border-granit/35 bg-kapur/40 text-arang text-sm placeholder-granit/50 focus:outline-none focus:border-rimba transition-colors"
                  placeholder="••••••••"
                />
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
            <a href="mailto:teknologi@wikimedia.or.id" className="text-rimba hover:underline">
              Hubungi pengelola
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
