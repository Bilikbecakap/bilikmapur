import type { Metadata } from "next";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Kategori Kamus" };
export const dynamic = "force-dynamic";

async function createKategori(formData: FormData) {
  "use server";
  const nama = (formData.get("nama") as string).trim();
  const slug = (formData.get("slug") as string).trim().toLowerCase().replace(/\s+/g, "-");
  const deskripsi = (formData.get("deskripsi") as string).trim();
  const urutan = parseInt(formData.get("urutan") as string, 10) || 0;
  if (!nama || !slug) return;
  await pool.query(
    "INSERT INTO kategori (nama, slug, deskripsi, urutan) VALUES ($1,$2,$3,$4) ON CONFLICT (slug) DO NOTHING",
    [nama, slug, deskripsi || null, urutan]
  );
  revalidatePath("/admin/kategori");
}

async function deleteKategori(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await pool.query("DELETE FROM kategori WHERE id = $1", [id]);
  revalidatePath("/admin/kategori");
}

async function updateUrutan(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string, 10);
  const urutan = parseInt(formData.get("urutan") as string, 10);
  if (!id || isNaN(urutan)) return;
  await pool.query("UPDATE kategori SET urutan=$1 WHERE id=$2", [urutan, id]);
  revalidatePath("/admin/kategori");
}

export default async function KategoriPage() {
  const { rows } = await pool.query(
    "SELECT k.id, k.nama, k.slug, k.deskripsi, k.urutan, COUNT(e.id)::int AS jumlah_lema FROM kategori k LEFT JOIN entries e ON e.kategori_id = k.id GROUP BY k.id ORDER BY k.urutan, k.nama"
  );

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-arang mb-1">Kategori Kamus</h1>
        <p className="text-sm text-teks-sekunder">
          Kelola jenis/kelas kata yang tersedia di kamus. Kategori ini muncul sebagai filter di halaman Kamus.
        </p>
      </div>

      {/* Daftar kategori */}
      <div className="rounded-xl border border-granit/25 overflow-hidden bg-white mb-8">
        <table className="w-full text-sm">
          <thead className="bg-kapur/50 border-b border-granit/20">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide">Nama</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide hidden sm:table-cell">Slug</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide hidden md:table-cell">Deskripsi</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide">Lema</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-teks-sekunder uppercase tracking-wide w-24">Urutan</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((k, i) => (
              <tr key={k.id} className={i !== 0 ? "border-t border-granit/15" : ""}>
                <td className="px-4 py-3 font-medium text-arang">{k.nama}</td>
                <td className="px-4 py-3 text-teks-sekunder font-mono text-xs hidden sm:table-cell">{k.slug}</td>
                <td className="px-4 py-3 text-teks-sekunder hidden md:table-cell text-xs max-w-xs truncate">{k.deskripsi ?? "—"}</td>
                <td className="px-4 py-3 text-teks-sekunder">{k.jumlah_lema}</td>
                <td className="px-4 py-3">
                  <form action={updateUrutan} className="flex items-center gap-1">
                    <input type="hidden" name="id" value={k.id} />
                    <input
                      name="urutan"
                      type="number"
                      defaultValue={k.urutan}
                      className="w-14 px-2 py-1 rounded border border-granit/30 text-xs text-arang focus:outline-none focus:border-arang"
                    />
                    <button type="submit" className="text-[11px] text-teks-sekunder hover:text-arang transition-colors px-1">✓</button>
                  </form>
                </td>
                <td className="px-4 py-3 text-right">
                  {k.jumlah_lema === 0 ? (
                    <DeleteButton
                      formAction={deleteKategori}
                      hiddenFields={{ id: String(k.id) }}
                      confirmMessage={`Hapus kategori "${k.nama}"?`}
                    />
                  ) : (
                    <span className="text-xs text-granit/40">Ada lema</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="py-12 text-center text-teks-sekunder text-sm">Belum ada kategori.</div>
        )}
      </div>

      {/* Form tambah kategori */}
      <div className="bg-white rounded-xl border border-granit/25 p-6">
        <h2 className="text-base font-semibold text-arang mb-5">Tambah Kategori</h2>
        <form action={createKategori} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-teks-sekunder mb-1.5">
                Nama kategori *
              </label>
              <input
                name="nama"
                required
                placeholder="mis. Kata Seru"
                className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-teks-sekunder mb-1.5">
                Slug (URL) *
              </label>
              <input
                name="slug"
                required
                placeholder="mis. kata-seru"
                className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang font-mono focus:outline-none focus:border-arang"
              />
              <p className="text-[11px] text-teks-sekunder mt-1">Huruf kecil, pisah dengan tanda -</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-teks-sekunder mb-1.5">
                Deskripsi (opsional)
              </label>
              <input
                name="deskripsi"
                placeholder="Penjelasan singkat kategori ini"
                className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-teks-sekunder mb-1.5">
                Urutan tampil
              </label>
              <input
                name="urutan"
                type="number"
                defaultValue="0"
                className="w-full px-3 py-2.5 rounded-lg border border-granit/30 bg-kapur/30 text-sm text-arang focus:outline-none focus:border-arang"
              />
              <p className="text-[11px] text-teks-sekunder mt-1">Angka kecil = muncul lebih dulu</p>
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-beras-merah text-kapur text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Tambah Kategori
          </button>
        </form>
      </div>
    </div>
  );
}
