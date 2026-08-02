export const KATEGORI_ARTIKEL = [
  "Pengumuman",
  "Informasi Budaya",
  "Sejarah & Adat",
  "Kegiatan",
  "Cerita Rakyat",
  "Umum",
] as const;

export type KategoriArtikel = (typeof KATEGORI_ARTIKEL)[number];
