import type { Metadata } from "next";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireAdminAction, requireAdminPage } from "@/lib/permissions";
import DeleteButton from "@/components/admin/DeleteButton";
import ChangePasswordButton from "@/components/admin/ChangePasswordButton";

export const metadata: Metadata = { title: "Pengguna" };
export const dynamic = "force-dynamic";

// Hanya admin yang boleh mengelola pengguna lain — lihat CLAUDE.md §5.
async function createUser(formData: FormData) {
  "use server";
  await requireAdminAction();
  const email = (formData.get("email") as string).toLowerCase().trim();
  const nama = (formData.get("nama") as string).trim();
  const password = formData.get("password") as string;
  const peran = formData.get("peran") as string;
  if (!email || !password) return;
  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    "INSERT INTO users (email, nama, password_hash, peran) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING",
    [email, nama || null, hash, peran]
  );
  revalidatePath("/admin/users");
}

async function deleteUser(formData: FormData) {
  "use server";
  const session = await requireAdminAction();
  const id = formData.get("id") as string;
  if (String(session.sub) === id) return; // jangan hapus diri sendiri
  await pool.query("DELETE FROM users WHERE id = $1", [id]);
  revalidatePath("/admin/users");
}

async function changePassword(formData: FormData) {
  "use server";
  await requireAdminAction();
  const id = formData.get("id") as string;
  const password = formData.get("password") as string;
  if (!password || password.length < 6) return;
  const hash = await bcrypt.hash(password, 12);
  await pool.query("UPDATE users SET password_hash=$1 WHERE id=$2", [hash, id]);
  revalidatePath("/admin/users");
}

export default async function UsersPage() {
  const session = await requireAdminPage();
  const { rows: users } = await pool.query(
    "SELECT id, email, nama, peran, to_char(dibuat_pada,'DD Mon YYYY') AS tgl FROM users ORDER BY dibuat_pada ASC"
  );

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-arang mb-1">Pengguna Admin</h1>
        <p className="text-sm text-teks-sekunder">Kelola akun yang bisa mengakses panel admin.</p>
      </div>

      <div className="rounded-xl border border-granit/25 overflow-hidden bg-white mb-8">
        <table className="w-full text-sm">
          <thead className="bg-kapur/50 border-b border-granit/20">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide hidden sm:table-cell">Nama</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide">Peran</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide hidden md:table-cell">Dibuat</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} className={i !== 0 ? "border-t border-granit/15" : ""}>
                <td className="px-4 py-3 text-arang font-medium">
                  {u.email}
                  {String(u.id) === session?.sub && <span className="ml-2 text-[11px] text-beras-merah font-medium">(Anda)</span>}
                </td>
                <td className="px-4 py-3 text-teks-sekunder hidden sm:table-cell">{u.nama ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${u.peran === "admin" ? "bg-beras-merah/15 text-beras-merah" : "bg-granit/20 text-teks-sekunder"}`}>
                    {u.peran}
                  </span>
                </td>
                <td className="px-4 py-3 text-teks-sekunder text-xs hidden md:table-cell">{u.tgl}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <ChangePasswordButton userId={String(u.id)} userEmail={u.email} formAction={changePassword} />
                    {String(u.id) !== session?.sub && (
                      <DeleteButton
                        formAction={deleteUser}
                        hiddenFields={{ id: String(u.id) }}
                        confirmMessage={`Hapus pengguna "${u.email}"?`}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-granit/25 p-6">
        <h2 className="text-base font-semibold text-arang mb-5">Tambah Pengguna</h2>
        <form action={createUser} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Email *</label>
              <input name="email" type="email" required className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
            </div>
            <div>
              <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Nama</label>
              <input name="nama" className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Password *</label>
              <input name="password" type="password" required minLength={6} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
            </div>
            <div>
              <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Peran</label>
              <select name="peran" className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang">
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button type="submit" className="px-5 py-2.5 rounded-lg bg-beras-merah text-kapur text-sm font-medium hover:opacity-90">
            Tambah Pengguna
          </button>
        </form>
      </div>
    </div>
  );
}
