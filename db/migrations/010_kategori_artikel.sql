BEGIN;
ALTER TABLE artikel ADD COLUMN IF NOT EXISTS kategori TEXT;
CREATE INDEX IF NOT EXISTS artikel_kategori_idx ON artikel (kategori);
COMMIT;
