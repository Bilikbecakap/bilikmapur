import type { Metadata } from "next";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

export const metadata: Metadata = { title: "Usulan" };
export const dynamic = "force-dynamic";

interface Sub {
  id: string;
  aksi: "tambah" | "edit" | "hapus";
  target_entry_id: string | null;
  target_lema: string | null;
  data_usulan: Record<string, unknown>;
  dibuat_pada: string;
}

async function approveAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const aksi = formData.get("aksi") as string;
  const target = formData.get("target_entry_id") as string | null;
  const dataRaw = formData.get("data_usulan") as string;
  const data = JSON.parse(dataRaw);

  if (aksi === "tambah") {
    await pool.query(
      `INSERT INTO entries (lema, kategori_id, arti_indonesia, contoh_kalimat_mapur, contoh_kalimat_indonesia, catatan, sumber)
       VALUES ($1, (SELECT id FROM kategori WHERE slug = $2 LIMIT 1), $3, $4, $5, $6, $7)`,
      [data.lema, data.kategori_slug ?? null, data.arti_indonesia, data.contoh_kalimat_mapur ?? null, data.contoh_kalimat_indonesia ?? null, data.catatan ?? null, data.sumber ?? null]
    );
  } else if (aksi === "edit" && target) {
    await pool.query(
      `UPDATE entries SET lema=$1, arti_indonesia=$2, contoh_kalimat_mapur=$3, contoh_kalimat_indonesia=$4, catatan=$5, sumber=$6, diperbarui_pada=now() WHERE id=$7`,
      [data.lema, data.arti_indonesia, data.contoh_kalimat_mapur ?? null, data.contoh_kalimat_indonesia ?? null, data.catatan ?? null, data.sumber ?? null, target]
    );
  } else if (aksi === "hapus" && target) {
    await pool.query("DELETE FROM entries WHERE id = $1", [target]);
  }

  await pool.query(
    "UPDATE submissions SET status='approved', diputuskan_pada=now() WHERE id=$1",
    [id]
  );
  revalidatePath("/admin/usulan");
}

async function rejectAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const catatan = formData.get("catatan_admin") as string;
  await pool.query(
    "UPDATE submissions SET status='rejected', catatan_admin=$1, diputuskan_pada=now() WHERE id=$2",
    [catatan || null, id]
  );
  revalidatePath("/admin/usulan");
}

export default async function UsulanPage() {
  const { rows: antrian } = await pool.query<Sub>(
    `SELECT s.id, s.aksi, s.target_entry_id, s.data_usulan,
            to_char(s.dibuat_pada AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI') AS dibuat_pada,
            e.lema AS target_lema
     FROM submissions s
     LEFT JOIN entries e ON e.id = s.target_entry_id
     WHERE s.status = 'pending'
     ORDER BY s.dibuat_pada ASC`
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-arang mb-1">Usulan</h1>
        <p className="text-sm text-teks-sekunder">
          {antrian.length === 0 ? "Tidak ada usulan yang menunggu." : `${antrian.length} usulan menunggu tinjauan.`}
        </p>
      </div>

      {antrian.length === 0 ? (
        <div className="rounded-xl border border-granit/25 bg-white p-12 text-center text-teks-sekunder text-sm">
          Semua usulan sudah ditinjau.
        </div>
      ) : (
        <div className="space-y-4">
          {antrian.map((s) => {
            const data = s.data_usulan ?? {};
            const badge = s.aksi === "tambah" ? "bg-rimba/15 text-rimba" : s.aksi === "edit" ? "bg-kulit-kayu/15 text-kulit-kayu" : "bg-beras-merah/15 text-beras-merah";
            return (
              <div key={s.id} className="rounded-xl border border-granit/25 bg-white p-5">
                <div className="flex items-start gap-3 mb-4">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide shrink-0 ${badge}`}>
                    {s.aksi}
                  </span>
                  {s.aksi !== "tambah" && s.target_lema && (
                    <span className="text-sm text-teks-sekunder">
                      Target: <em className="text-kulit-kayu">{s.target_lema}</em>
                    </span>
                  )}
                  <span className="ml-auto text-[11px] text-teks-sekunder shrink-0">{s.dibuat_pada}</span>
                </div>

                {Object.entries(data).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="mb-2">
                    <span className="text-[11px] font-medium text-teks-sekunder uppercase tracking-wide">{k}:</span>
                    <span className="text-sm text-arang ml-2">{String(v)}</span>
                  </div>
                ))}

                <div className="flex gap-3 mt-4 pt-4 border-t border-granit/15">
                  <form action={approveAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="aksi" value={s.aksi} />
                    <input type="hidden" name="target_entry_id" value={s.target_entry_id ?? ""} />
                    <input type="hidden" name="data_usulan" value={JSON.stringify(s.data_usulan)} />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-rimba/15 text-rimba text-sm font-medium hover:bg-rimba/25 transition-colors"
                    >
                      ✓ Setujui
                    </button>
                  </form>

                  <form action={rejectAction} className="flex gap-2">
                    <input type="hidden" name="id" value={s.id} />
                    <input
                      name="catatan_admin"
                      placeholder="Alasan penolakan (opsional)"
                      className="px-3 py-2 rounded-lg border border-granit/30 text-sm text-arang bg-kapur/50 focus:outline-none focus:border-arang"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-beras-merah/10 text-beras-merah text-sm font-medium hover:bg-beras-merah/20 transition-colors"
                    >
                      ✗ Tolak
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
