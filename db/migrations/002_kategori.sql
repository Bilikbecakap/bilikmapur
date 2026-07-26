BEGIN;
CREATE TABLE IF NOT EXISTS kategori (
  id        SERIAL PRIMARY KEY,
  nama      TEXT NOT NULL,
  slug      TEXT NOT NULL UNIQUE,
  deskripsi TEXT,
  urutan    INT DEFAULT 0
);
COMMIT;
