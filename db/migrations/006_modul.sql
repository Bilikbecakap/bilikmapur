BEGIN;
CREATE TABLE IF NOT EXISTS modul (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  deskripsi       TEXT,
  file_pdf        TEXT NOT NULL,   -- key file PDF
  gambar_sampul   TEXT,            -- key file gambar
  jumlah_halaman  INT,
  kategori        TEXT,
  warna_penanda   TEXT CHECK (warna_penanda IN ('beras-merah','rimba','kulit-kayu')),
  urutan          INT DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'published',
  dibuat_pada     TIMESTAMPTZ NOT NULL DEFAULT now(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMIT;
