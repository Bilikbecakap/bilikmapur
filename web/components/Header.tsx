"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/kamus", label: "Kamus" },
  { href: "/video", label: "Video" },
  { href: "/artikel", label: "Artikel" },
  { href: "/modul", label: "Modul" },
  { href: "/tentang", label: "Tentang" },
];

export default function Header({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-granit/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Logo />

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive(link.href)
                    ? "text-beras-merah font-semibold"
                    : "text-arang/60 hover:text-arang"
                }`}
                style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={isLoggedIn ? "/admin" : "/admin/login"}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-medium bg-rimba text-kapur hover:opacity-90 transition-opacity"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              {isLoggedIn ? "Dashboard" : "Masuk"}
            </Link>
          </nav>

          {/* Mobile burger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            className="md:hidden p-2 rounded text-arang/50 hover:text-arang transition-colors"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden py-3 border-t border-granit/30 flex flex-col gap-0.5 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive(link.href)
                    ? "text-beras-merah font-semibold bg-beras-merah/6"
                    : "text-arang/65 hover:text-arang hover:bg-granit/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={isLoggedIn ? "/admin" : "/admin/login"}
              onClick={() => setMenuOpen(false)}
              className="mx-3 mt-2 py-2.5 rounded text-sm font-medium text-center bg-rimba text-kapur hover:opacity-90 transition-opacity"
            >
              {isLoggedIn ? "Dashboard" : "Masuk"}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
