BEGIN;
CREATE TABLE IF NOT EXISTS entries (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lema                     TEXT NOT NULL,
  kategori_id              INT REFERENCES kategori(id),
  arti_indonesia           TEXT NOT NULL,
  contoh_kalimat_mapur     TEXT,
  contoh_kalimat_indonesia TEXT,
  pelafalan_ipa            TEXT,
  audio                    TEXT,   -- key file (mis. "abc123.mp3"), bukan URL
  catatan                  TEXT,
  sumber                   TEXT,
  status                   TEXT NOT NULL DEFAULT 'published',
  dibuat_pada              TIMESTAMPTZ NOT NULL DEFAULT now(),
  diperbarui_pada          TIMESTAMPTZ NOT NULL DEFAULT now(),
  search                   tsvector GENERATED ALWAYS AS (
                             to_tsvector('simple',
                               coalesce(lema,'') || ' ' || coalesce(arti_indonesia,''))
                           ) STORED
);

CREATE INDEX IF NOT EXISTS entries_search_idx    ON entries USING gin (search);
CREATE INDEX IF NOT EXISTS entries_lema_trgm_idx ON entries USING gin (lema gin_trgm_ops);
CREATE INDEX IF NOT EXISTS entries_arti_trgm_idx ON entries USING gin (arti_indonesia gin_trgm_ops);
COMMIT;
