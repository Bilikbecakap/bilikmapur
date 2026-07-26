BEGIN;
CREATE TABLE IF NOT EXISTS submissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipe_konten     TEXT NOT NULL DEFAULT 'entry',
  aksi            TEXT NOT NULL,
  target_entry_id UUID REFERENCES entries(id),
  data_usulan     JSONB,
  nama_pengusul   TEXT,
  kontak          TEXT,
  ip_hash         TEXT,
  status          TEXT NOT NULL DEFAULT 'pending',
  catatan_admin   TEXT,
  dibuat_pada     TIMESTAMPTZ NOT NULL DEFAULT now(),
  diputuskan_pada TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS submissions_status_idx ON submissions (status);
CREATE INDEX IF NOT EXISTS submissions_iphash_idx ON submissions (ip_hash, dibuat_pada);
COMMIT;
