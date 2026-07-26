"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ variant = "topbar" }: { variant?: "topbar" | "sidebar" }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (variant === "sidebar") {
    return (
      <button
        onClick={handleLogout}
        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-kapur/50 hover:text-beras-merah hover:bg-beras-merah/10 transition-colors"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Keluar
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-granit/30 text-sm text-teks-sekunder hover:border-beras-merah hover:text-beras-merah transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      Keluar
    </button>
  );
}
