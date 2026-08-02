import type { Metadata } from "next";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { requireSessionAction } from "@/lib/permissions";

export const metadata: Metadata = { title: "Profil Saya" };
export const dynamic = "force-dynamic";

async function changeOwnPassword(formData: FormData) {
  "use server";
  const session = await requireSessionAction();
  const passwordLama = formData.get("password_lama") as string;
  const passwordBaru = formData.get("password_baru") as string;
  const konfirmasi = formData.get("konfirmasi") as string;

  if (!passwordLama || !passwordBaru || passwordBaru.length < 6) {
    redirect("/admin/profil?galat=Isi+semua+kolom%2C+password+baru+minimal+6+karakter.");
  }
  if (passwordBaru !== konfirmasi) {
    redirect("/admin/profil?galat=Konfirmasi+password+baru+tidak+cocok.");
  }

  const { rows } = await pool.query("SELECT password_hash FROM users WHERE id = $1", [Number(session.sub)]);
  const cocok = rows[0] && (await bcrypt.compare(passwordLama, rows[0].password_hash));
  if (!cocok) {
    redirect("/admin/profil?galat=Password+lama+salah.");
  }

  const hash = await bcrypt.hash(passwordBaru, 12);
  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [hash, Number(session.sub)]);
  redirect("/admin/profil?sukses=1");
}

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await requireSessionAction();
  const sp = await searchParams;
  const galat = sp.galat;
  const sukses = sp.sukses;

  const { rows } = await pool.query(
    "SELECT email, nama, peran FROM users WHERE id = $1",
    [Number(session.sub)]
  );
  const user = rows[0];

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-arang mb-1">Profil Saya</h1>
        <p className="text-sm text-teks-sekunder">Informasi akun dan ganti password Anda sendiri.</p>
      </div>

      <div className="bg-white rounded-xl border border-granit/25 p-6 mb-6">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-teks-sekunder">Email</dt>
            <dd className="text-arang font-medium">{user?.email}</dd>
          </div>
          {user?.nama && (
            <div className="flex justify-between">
              <dt className="text-teks-sekunder">Nama</dt>
              <dd className="text-arang font-medium">{user.nama}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-teks-sekunder">Peran</dt>
            <dd>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${user?.peran === "admin" ? "bg-beras-merah/15 text-beras-merah" : "bg-granit/20 text-teks-sekunder"}`}>
                {user?.peran}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-xl border border-granit/25 p-6">
        <h2 className="text-base font-semibold text-arang mb-5">Ganti Password</h2>

        {galat && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-beras-merah/10 text-beras-merah text-sm">{galat}</div>
        )}
        {sukses && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-rimba/10 text-rimba text-sm">Password berhasil diperbarui.</div>
        )}

        <form action={changeOwnPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Password saat ini</label>
            <input name="password_lama" type="password" required className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
          </div>
          <div>
            <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Password baru</label>
            <input name="password_baru" type="password" required minLength={6} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
          </div>
          <div>
            <label className="block text-xs font-medium text-teks-sekunder mb-1.5">Konfirmasi password baru</label>
            <input name="konfirmasi" type="password" required minLength={6} className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang" />
          </div>
          <button type="submit" className="px-5 py-2.5 rounded-lg bg-beras-merah text-kapur text-sm font-medium hover:opacity-90">
            Simpan Password Baru
          </button>
        </form>
      </div>
    </div>
  );
}
