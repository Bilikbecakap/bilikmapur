BEGIN;

ALTER TABLE entries  ADD COLUMN IF NOT EXISTS dihapus_pada TIMESTAMPTZ;
ALTER TABLE entries  ADD COLUMN IF NOT EXISTS dihapus_oleh INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE artikel  ADD COLUMN IF NOT EXISTS dihapus_pada TIMESTAMPTZ;
ALTER TABLE artikel  ADD COLUMN IF NOT EXISTS dihapus_oleh INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE video    ADD COLUMN IF NOT EXISTS dihapus_pada TIMESTAMPTZ;
ALTER TABLE video    ADD COLUMN IF NOT EXISTS dihapus_oleh INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE modul    ADD COLUMN IF NOT EXISTS dihapus_pada TIMESTAMPTZ;
ALTER TABLE modul    ADD COLUMN IF NOT EXISTS dihapus_oleh INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE kategori ADD COLUMN IF NOT EXISTS dihapus_pada TIMESTAMPTZ;
ALTER TABLE kategori ADD COLUMN IF NOT EXISTS dihapus_oleh INT REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS entries_dihapus_idx  ON entries  (dihapus_pada) WHERE dihapus_pada IS NOT NULL;
CREATE INDEX IF NOT EXISTS artikel_dihapus_idx  ON artikel  (dihapus_pada) WHERE dihapus_pada IS NOT NULL;
CREATE INDEX IF NOT EXISTS video_dihapus_idx    ON video    (dihapus_pada) WHERE dihapus_pada IS NOT NULL;
CREATE INDEX IF NOT EXISTS modul_dihapus_idx    ON modul    (dihapus_pada) WHERE dihapus_pada IS NOT NULL;
CREATE INDEX IF NOT EXISTS kategori_dihapus_idx ON kategori (dihapus_pada) WHERE dihapus_pada IS NOT NULL;

-- entries yang punya riwayat submission (approved/rejected lama tidak pernah dibersihkan)
-- tidak boleh menghalangi hapus permanen dari Sampah -- submissions sudah simpan snapshot JSON.
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_target_entry_id_fkey;
ALTER TABLE submissions
  ADD CONSTRAINT submissions_target_entry_id_fkey
  FOREIGN KEY (target_entry_id) REFERENCES entries(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS activity_log (
  id           BIGSERIAL PRIMARY KEY,
  aksi         TEXT NOT NULL,            -- 'tambah' | 'edit' | 'hapus' | 'pulihkan' | 'hapus_permanen'
  tipe_konten  TEXT NOT NULL,            -- 'entry' | 'artikel' | 'video' | 'modul' | 'kategori'
  target_id    TEXT NOT NULL,
  ringkasan    TEXT NOT NULL,
  pelaku_id    INT REFERENCES users(id) ON DELETE SET NULL,
  pelaku_email TEXT NOT NULL,
  dibuat_pada  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS activity_log_tipe_idx   ON activity_log (tipe_konten, dibuat_pada DESC);
CREATE INDEX IF NOT EXISTS activity_log_pelaku_idx ON activity_log (pelaku_id);
CREATE INDEX IF NOT EXISTS activity_log_waktu_idx  ON activity_log (dibuat_pada DESC);

COMMIT;
