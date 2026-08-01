import type { PoolClient } from "pg";
import pool from "@/lib/db";
import type { SessionPayload } from "@/lib/auth";

export type AksiLog = "tambah" | "edit" | "hapus" | "pulihkan" | "hapus_permanen";
export type TipeKonten = "entry" | "artikel" | "video" | "modul" | "kategori";

interface HasilMutasi {
  ringkasan: string;
  targetId?: string;
}

/**
 * Jalankan satu mutasi beserta catatan log dalam satu transaksi.
 * `run(client)` melakukan mutasi lalu WAJIB mengembalikan ringkasan (untuk log),
 * atau `null` untuk membatalkan tanpa efek (mis. baris sudah dihapus lebih dulu) --
 * dalam hal ini transaksi di-ROLLBACK dan tidak ada log yang ditulis.
 * Jangan panggil redirect()/revalidatePath() di dalam `run` -- panggil setelah
 * withActivityLog() selesai (setelah commit), karena redirect() melempar exception
 * yang akan tertangkap sebagai error dan membatalkan transaksi yang seharusnya sudah commit.
 */
export async function withActivityLog(
  pelaku: SessionPayload,
  meta: { aksi: AksiLog; tipeKonten: TipeKonten; targetId?: string },
  run: (client: PoolClient) => Promise<HasilMutasi | null>
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const hasil = await run(client);
    if (!hasil) {
      await client.query("ROLLBACK");
      return;
    }
    const targetId = hasil.targetId ?? meta.targetId ?? "";
    const { rows } = await client.query("SELECT email FROM users WHERE id = $1", [Number(pelaku.sub)]);
    const pelakuEmail = rows[0]?.email ?? "(tidak diketahui)";
    await client.query(
      `INSERT INTO activity_log (aksi, tipe_konten, target_id, ringkasan, pelaku_id, pelaku_email)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [meta.aksi, meta.tipeKonten, targetId, hasil.ringkasan, Number(pelaku.sub), pelakuEmail]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
