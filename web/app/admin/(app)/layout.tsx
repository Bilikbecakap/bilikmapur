import type { Metadata } from "next";
import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

export const metadata: Metadata = { title: { template: "%s — Admin Mapur", default: "Admin Mapur" } };

const NAV = [
  { href: "/admin",          label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", adminOnly: false },
  { href: "/admin/usulan",   label: "Usulan",    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", adminOnly: false },
  { href: "/admin/kamus",    label: "Kamus",     icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", adminOnly: false },
  { href: "/admin/kategori", label: "Kategori",  icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z", adminOnly: false },
  { href: "/admin/artikel",  label: "Artikel",   icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z", adminOnly: false },
  { href: "/admin/video",    label: "Video",     icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z", adminOnly: false },
  { href: "/admin/modul",    label: "Modul",     icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z", adminOnly: false },
  { href: "/admin/sampah",   label: "Sampah",    icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16", adminOnly: true },
  { href: "/admin/log-aktivitas", label: "Log Aktivitas", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", adminOnly: true },
  { href: "/admin/users",    label: "Pengguna",  icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", adminOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const nav = NAV.filter((item) => !item.adminOnly || isAdmin(session?.peran));

  return (
    <div className="min-h-screen flex bg-[#F4F5F7]">

      {/* ── Sidebar ── */}
      <aside className="w-56 shrink-0 bg-[#1C1C1E] flex flex-col sticky top-0 h-screen">
        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-white/8">
          <Link
            href="/admin"
            className="text-[22px] font-semibold text-white tracking-tight"
            style={{ fontFamily: "var(--font-source-serif-4), Newsreader, serif" }}
          >
            mapur
          </Link>
          <p className="text-[10px] text-white/30 mt-0.5 uppercase tracking-widest">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          {nav.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/8 transition-colors mb-0.5"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-80">
                <path d={icon} />
              </svg>
              {label}
            </Link>
          ))}
        </nav>

        {/* Keluar */}
        <div className="px-3 pb-5 pt-3 border-t border-white/8">
          <LogoutButton variant="sidebar" />
        </div>
      </aside>

      {/* ── Content area ── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-black/6 flex items-center justify-between px-8 sticky top-0 z-30">
          <span className="text-sm font-medium text-[#1C1C1E]/40 tracking-wide">Bahasa Mapur</span>
          <Link
            href="/"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1C1C1E] text-white text-xs font-medium hover:bg-[#1C1C1E]/80 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Lihat Situs
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
