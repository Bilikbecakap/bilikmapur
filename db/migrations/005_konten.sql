BEGIN;
CREATE TABLE IF NOT EXISTS artikel (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  ringkasan       TEXT,
  konten          TEXT,
  penulis         TEXT,
  gambar_sampul   TEXT,   -- key file
  warna_penanda   TEXT CHECK (warna_penanda IN ('beras-merah','rimba','kulit-kayu')),
  status          TEXT NOT NULL DEFAULT 'draft',
  dibuat_pada     TIMESTAMPTZ NOT NULL DEFAULT now(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS video (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul       TEXT NOT NULL,
  deskripsi   TEXT,
  youtube_id  TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'published',
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS halaman (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul   TEXT NOT NULL,
  slug    TEXT NOT NULL UNIQUE,
  konten  TEXT,
  status  TEXT NOT NULL DEFAULT 'published'
);
COMMIT;
