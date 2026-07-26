# CLAUDE.md — Situs Digitalisasi Bahasa Mapur

> File ini adalah **instruksi kerja untuk agen (Claude CLI)**. Baca seluruhnya sebelum
> mulai. Kerjakan **fase demi fase secara berurutan**, dan **berhenti di akhir tiap fase**
> untuk memberi kesempatan pemilik proyek memverifikasi sebelum lanjut.

---

## 1. Konteks proyek

Situs untuk mendokumentasikan dan menghidupkan **bahasa Mapur** (bahasa daerah, Pulau
Bangka). Fitur utama:

1. Informasi umum tentang bahasa Mapur (halaman profil, sejarah, dsb).
2. **Kamus digital** dua arah (Mapur ⇄ Indonesia). Data awal 3.000–4.000 lema.
3. Daftar **video** (embed YouTube, metadata di database).
4. Daftar **artikel**.
5. **Modul / buku digital** (PDF yang diunggah) — tampil sebagai daftar modul.
6. **Kontribusi terbuka**: siapa pun boleh mengusulkan tambah/edit/hapus lema tanpa akun,
   setiap usulan divalidasi admin sebelum diterapkan.

Prinsip yang harus dijaga:
- **Data bahasa tidak tergantikan.** Backup dan portabilitas data adalah prioritas.
- **Non-teknis-first.** Pengelolaan konten harian harus bisa dilakukan tanpa menyentuh kode.
- **Kontemporer, bukan "arsip lama".** (Lihat aturan desain §15.)

---

## 2. Keputusan arsitektur (sudah dikunci — jangan diubah tanpa konfirmasi)

**Deploy tanpa Docker.** Kode di-push ke GitHub, di-clone ke VPS, dijalankan native, dikelola PM2.

| Lapisan | Teknologi | Alasan |
|---|---|---|
| Frontend + Admin | **Next.js 15** (App Router) + TypeScript | Satu app untuk publik dan admin |
| Admin panel | **`/admin`** built-in Next.js + server actions + JWT cookie | Satu domain, tidak ada proses tambahan |
| Styling | **Tailwind CSS v4** + **shadcn/ui** | Token desain §15 |
| Database | **PostgreSQL** (native di VPS) | `pg_trgm` + FTS, data kamus |
| File storage | **Cloudflare R2** via `@aws-sdk/client-s3` | Audio + PDF, egress gratis |
| Anti-spam | **Cloudflare Turnstile** + rate limit + honeypot | Kontribusi anonim |
| SSL / reverse proxy | **Caddy** | HTTPS otomatis, satu domain |
| Manajemen proses | **PM2** | Next.js hidup terus, auto-start saat reboot |
| Deploy | `git clone + pnpm build` di VPS | Update via `git pull` |
| Backup | `pg_dump` nightly → R2 via cron | Off-site backup database |

**Tidak ada Directus.** Admin panel dibangun langsung dalam Next.js di `/admin`.
**Tidak ada Docker.** Semua native.
**Satu domain.** Next.js menangani semua (publik + admin) di port 3000.

---

## 2A. Development lokal vs produksi

| Hal | Lokal | Produksi |
|---|---|---|
| Storage file | **disk lokal** (`./uploads/`, dilayani via `/api/files/`) | **Cloudflare R2** |
| PostgreSQL | lokal (boleh via Docker khusus DB) | native di VPS |
| Menjalankan app | `pnpm dev` | **PM2** |
| Reverse proxy / SSL | tidak perlu | **Caddy** |
| Turnstile | test keys resmi Cloudflare | key asli |

**`web/.env.local` versi lokal:**
```dotenv
DATABASE_URL=postgres://mapur:<password>@127.0.0.1:5432/mapur
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Auth admin (JWT) — isi dengan string acak panjang
SESSION_SECRET=dev-secret-ganti-di-produksi-dengan-string-acak-panjang

# Storage — kosongkan R2 untuk pakai disk lokal
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_ENDPOINT=
R2_PUBLIC_URL=   # kosong = /api/files/ (lokal)

# Turnstile TEST KEYS resmi Cloudflare
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
IP_HASH_SALT=salt-dev-bebas
```

> Saat `R2_PUBLIC_URL` kosong, `fileUrl()` mengembalikan `/api/files/<key>` sehingga
> file dilayani oleh Next.js API route dari disk lokal (`./uploads/`).

Tambahkan ke `.gitignore`: `web/.env.local`, `uploads/`, `.next/`, `node_modules/`.

---

## 3. Struktur folder

```
mapur/
├── CLAUDE.md
├── Caddyfile
├── ecosystem.config.js       # PM2
├── deploy.sh
├── .env.example
├── db/
│   ├── run-migrations.sh
│   ├── reset.sh
│   └── migrations/
│       ├── 001_extensions.sql
│       ├── 002_kategori.sql
│       ├── 003_entries.sql
│       ├── 004_submissions.sql
│       ├── 005_konten.sql
│       ├── 006_modul.sql
│       └── 007_users.sql
├── backup/
│   └── pg_backup.sh
└── web/
    ├── app/
    │   ├── admin/            # protected by middleware
    │   │   ├── layout.tsx
    │   │   ├── page.tsx      # dashboard
    │   │   ├── login/
    │   │   ├── kamus/
    │   │   ├── usulan/
    │   │   ├── artikel/
    │   │   ├── video/
    │   │   ├── modul/
    │   │   └── users/
    │   ├── api/
    │   │   ├── auth/login/   # POST login
    │   │   ├── auth/logout/  # POST logout
    │   │   ├── upload/       # POST file upload
    │   │   ├── files/        # GET file lokal (dev only)
    │   │   ├── cari/         # GET pencarian kamus
    │   │   └── usulan/       # POST usulan anonim
    │   └── (halaman publik)
    ├── components/
    ├── lib/
    │   ├── db.ts
    │   ├── auth.ts           # JWT session
    │   ├── storage.ts        # fileUrl() + upload
    │   └── utils.ts
    ├── middleware.ts          # proteksi /admin/*
    └── scripts/
        └── create-admin.mjs  # seed akun admin pertama
```

Node.js **v22 LTS atau lebih baru**. Gunakan **pnpm** di `web/`.

---

## 4. Skema database

### Konvensi
- Tiap file: `BEGIN; ... COMMIT;` — atomic.
- `IF NOT EXISTS` — aman diulang.
- Kolom file: `TEXT` — menyimpan **key file** (mis. `abc123.mp3`).
  `fileUrl(key)` di `lib/storage.ts` merakit URL lengkap.

### 4.1 `001_extensions.sql`
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 4.2 `002_kategori.sql`
```sql
BEGIN;
CREATE TABLE IF NOT EXISTS kategori (
  id        SERIAL PRIMARY KEY,
  nama      TEXT NOT NULL,
  slug      TEXT NOT NULL UNIQUE,
  deskripsi TEXT,
  urutan    INT DEFAULT 0
);
COMMIT;
```

### 4.3 `003_entries.sql`
```sql
BEGIN;
CREATE TABLE IF NOT EXISTS entries (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lema                     TEXT NOT NULL,
  kategori_id              INT REFERENCES kategori(id),
  arti_indonesia           TEXT NOT NULL,
  contoh_kalimat_mapur     TEXT,
  contoh_kalimat_indonesia TEXT,
  pelafalan_ipa            TEXT,
  audio                    TEXT,   -- key file (mis. "abc123.mp3")
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
```

### 4.4 `004_submissions.sql`
```sql
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
```

### 4.5 `005_konten.sql`
```sql
BEGIN;
CREATE TABLE IF NOT EXISTS artikel (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  ringkasan       TEXT,
  konten          TEXT,
  penulis         TEXT,
  gambar_sampul   TEXT,
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
```

### 4.6 `006_modul.sql`
```sql
BEGIN;
CREATE TABLE IF NOT EXISTS modul (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  deskripsi       TEXT,
  file_pdf        TEXT NOT NULL,
  gambar_sampul   TEXT,
  jumlah_halaman  INT,
  kategori        TEXT,
  warna_penanda   TEXT CHECK (warna_penanda IN ('beras-merah','rimba','kulit-kayu')),
  urutan          INT DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'published',
  dibuat_pada     TIMESTAMPTZ NOT NULL DEFAULT now(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMIT;
```

### 4.7 `007_users.sql`
```sql
BEGIN;
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  nama          TEXT,
  password_hash TEXT NOT NULL,
  peran         TEXT NOT NULL DEFAULT 'editor',
  dibuat_pada   TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMIT;
```

---

## 5. Auth admin

- JWT di httpOnly cookie `session`, expire 24 jam, HS256.
- `SESSION_SECRET` = string acak min 32 karakter.
- Middleware proteksi semua `/admin/*` kecuali `/admin/login`.
- Buat akun pertama: `cd web && node scripts/create-admin.mjs email password`
- Hanya `peran='admin'` yang bisa kelola users.

---

## 6. File storage

```
lib/storage.ts  fileUrl(key):
  Jika R2_PUBLIC_URL → ${R2_PUBLIC_URL}/${key}
  Jika kosong        → /api/files/${key}  (served dari ./uploads/ lokal)

POST /api/upload  (FormData: file):
  Lokal  → simpan ke ./uploads/<uuid>.<ext>  → { key }
  Produksi → upload ke R2 key <uuid>.<ext>  → { key }
```

Bucket R2 harus publik (aktifkan R2.dev subdomain).
Key disimpan di kolom TEXT di database.
Upload PDF modul hanya lewat admin panel (bukan anonim).

---

## 7. Import data kamus

Template CSV: `lema, kategori_slug, arti_indonesia, contoh_kalimat_mapur, contoh_kalimat_indonesia, sumber`.
Import lewat halaman admin `/admin/kamus` (fitur import CSV) atau langsung via psql COPY.
Kolom `audio` tidak lewat CSV — upload per lema di admin.

---

## 8. Pengembangan lokal

```bash
# Prasyarat: PostgreSQL jalan, database mapur dibuat
./db/run-migrations.sh "postgres://mapur:<pw>@127.0.0.1:5432/mapur"
cd web
node scripts/create-admin.mjs admin@example.com password
pnpm dev
# Buka localhost:3000 (publik) dan localhost:3000/admin (admin)
```

---

## 9. Deployment produksi

`ecosystem.config.js`:
```js
const path = require('path');
module.exports = { apps: [{
  name: 'web',
  cwd: path.join(__dirname, 'web'),
  script: path.join(__dirname, 'web', 'node_modules', '.bin', 'next'),
  args: 'start -p 3000',
}]};
```

`deploy.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
git pull
( cd web && pnpm install && pnpm build )
pm2 restart ecosystem.config.js
```

```bash
pm2 start ecosystem.config.js && pm2 save && pm2 startup
sudo systemctl reload caddy
```

---

## 10. Backup

`backup/pg_backup.sh`: `pg_dump` → kompres → upload ke R2. Jadwalkan cron nightly.
Uji restore dari backup minimal sekali.

---

## 11. Migrasi skema produksi

Sebelum go-live, ganti `run-migrations.sh` dengan migration tool ber-riwayat
(**dbmate** atau **node-pg-migrate**) agar perubahan skema di masa depan aman.

---

## 12. Halaman publik

- **Fase 9**: Artikel (daftar + detail), Video (embed YouTube), Modul (kartu + iframe PDF + unduh).
- `fileUrl(key)` untuk semua file.
- Iframe PDF untuk modul (bukan PDF.js — upgrade nanti).

---

## 13. Usulan anonim (form kontribusi)

- Lapisan anti-spam: Turnstile + honeypot + rate limit + validasi server.
- `ip_hash = sha256(ip + IP_HASH_SALT)`.
- 3 aksi: tambah, edit, hapus. Semua `pending` sampai admin approve.

---

## 14. Aturan main untuk agen

- Kerjakan berurutan; berhenti & lapor di akhir tiap fase.
- **Tanpa Docker.** Satu app Next.js untuk semua.
- **Jangan** mengarang data lema.
- **Jangan** simpan file di kolom DB — pakai key TEXT.
- **Jangan** commit `.env` / `.env.local`.
- **JWT hanya httpOnly cookie** — jangan expose ke klien.
- Taati aturan desain §15.
- Tanya jika keputusan ambigu.

---

## 15. Design system

### Warna (light mode only — tanpa dark mode)

| Token | Hex | Peran |
|---|---|---|
| `kapur` | `#F7F2E8` | Latar dominan (~60%) |
| `rumbia` | `#E4D8BE` | Kartu/boks |
| `arang` | `#23201C` | Teks utama |
| `teks-sekunder` | `#5A5348` | Teks sekunder |
| `beras-merah` | `#A0472A` | Tombol utama, aksen (~10%) |
| `rimba` | `#33503C` | Struktural (header/footer) |
| `kulit-kayu` | `#6B4A2E` | Kata Mapur miring |
| `granit` | `#B3A995` | Garis pemisah; bukan untuk teks |

**Aturan tidak boleh dilanggar:**
- 60–30–10: kapur latar, kulit-kayu+rimba struktural, beras-merah hanya aksen.
- `rumbia` dan `granit` tidak boleh jadi warna teks.
- Tidak ada motif tenun/ukiran generik, filter sepia, atau emas+hitam.

### Tipografi
- Judul: **Source Serif 4** (fallback Newsreader, serif).
- Isi: **Inter** (fallback Work Sans, sans-serif).
- Kata Mapur: `.istilah-mapur { font-style: italic; color: var(--kulit-kayu); }`.

### Container
- Homepage: `max-w-6xl`
- List pages: `max-w-5xl`
- Detail/reading: `max-w-2xl`
- Admin content: `max-w-5xl`

---

## 16. Variabel lingkungan (referensi produksi)

```dotenv
DATABASE_URL=postgres://mapur:<password>@127.0.0.1:5432/mapur
NEXT_PUBLIC_SITE_URL=https://<domain>
SESSION_SECRET=<string acak, min 32 karakter>
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=mapur-media
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-<hash>.r2.dev
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
IP_HASH_SALT=<string acak>
```

---

## 17. Fase Lanjutan (tunggu diminta)

- PWA / mode offline + Fuse.js.
- Ekspor CSV/LIFT data kamus.
- WYSIWYG editor (Tiptap) untuk artikel.
- Arsip audio ke ELAR/PARADISEC.
- Import CSV massal lewat UI admin.
