import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/auth";

export function isAdmin(peran: string | undefined | null): boolean {
  return peran === "admin";
}

/** Ambil session dan pastikan perannya admin. Redirect ke /admin jika bukan. */
export async function requireAdminPage(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || !isAdmin(session.peran)) {
    redirect("/admin");
  }
  return session;
}

/** Untuk dipakai di dalam server action. Melempar error (aksi dibatalkan) jika bukan admin. */
export async function requireAdminAction(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || !isAdmin(session.peran)) {
    throw new Error("Aksi ini hanya bisa dilakukan oleh admin.");
  }
  return session;
}

/** Untuk aksi yang boleh dilakukan admin maupun editor -- memastikan identitas pelaku ada untuk logging. */
export async function requireSessionAction(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Sesi tidak valid.");
  }
  return session;
}
