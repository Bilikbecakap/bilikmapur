BEGIN;
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  nama          TEXT,
  password_hash TEXT NOT NULL,
  peran         TEXT NOT NULL DEFAULT 'editor',  -- 'admin' | 'editor'
  dibuat_pada   TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMIT;
