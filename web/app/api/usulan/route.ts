import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import pool from "@/lib/db";

const RATE_LIMIT = 8;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const URL_RE = /https?:\/\/|www\./i;
const HTML_RE = /<[^>]+>/;

function clean(val: FormDataEntryValue | null): string | null {
  if (!val || typeof val !== "string") return null;
  return val.trim() || null;
}

function validate(
  val: string | null,
  maxLen: number,
  required = false
): string | null {
  const s = (val ?? "").trim();
  if (!s) return required ? "Wajib diisi." : null;
  if (s.length > maxLen) return `Terlalu panjang (maks. ${maxLen} karakter).`;
  if (URL_RE.test(s)) return "Tidak boleh mengandung URL.";
  if (HTML_RE.test(s)) return "Tidak boleh mengandung tag HTML.";
  return null;
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: token,
          remoteip: ip,
        }),
      }
    );
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ pesan: "Format permintaan tidak valid." }, { status: 400 });
  }

  // Honeypot — silent reject jika terisi
  const honeypot = clean(formData.get("website"));
  if (honeypot) {
    return NextResponse.json({ sukses: true });
  }

  const aksi = clean(formData.get("aksi"));
  if (!aksi || !["tambah", "edit", "hapus"].includes(aksi)) {
    return NextResponse.json({ pesan: "Aksi tidak valid." }, { status: 400 });
  }

  // Dapatkan IP
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  // Verifikasi Turnstile
  const turnstileToken = clean(formData.get("cf-turnstile-response"));
  const turnstileOk = await verifyTurnstile(turnstileToken ?? "", ip);
  if (!turnstileOk) {
    return NextResponse.json(
      { pesan: "Verifikasi keamanan gagal. Muat ulang halaman dan coba lagi." },
      { status: 400 }
    );
  }

  // Hash IP (SHA-256 + salt) — JANGAN simpan IP mentah
  const ipHash = createHash("sha256")
    .update(`${ip}${process.env.IP_HASH_SALT ?? ""}`)
    .digest("hex");

  // Rate limit: maks 8 usulan per jam per ip_hash
  const { rows: rl } = await pool.query(
    `SELECT COUNT(*) AS jumlah FROM submissions
     WHERE ip_hash = $1 AND dibuat_pada > now() - interval '1 hour'`,
    [ipHash]
  );
  if (parseInt(rl[0].jumlah, 10) >= RATE_LIMIT) {
    return NextResponse.json(
      { pesan: "Terlalu banyak usulan dalam 1 jam. Silakan coba lagi nanti." },
      { status: 429 }
    );
  }

  // Validasi & bangun data_usulan
  let targetId: string | null = null;
  let dataUsulan: Record<string, unknown> = {};

  if (aksi === "tambah" || aksi === "edit") {
    if (aksi === "edit") {
      targetId = clean(formData.get("target_entry_id"));
      if (!targetId || !UUID_RE.test(targetId)) {
        return NextResponse.json({ pesan: "ID lema target tidak valid." }, { status: 400 });
      }
    }

    const lema = clean(formData.get("lema"));
    const arti = clean(formData.get("arti_indonesia"));

    const errLema = validate(lema, 200, true);
    if (errLema) return NextResponse.json({ pesan: `Kata Mapur: ${errLema}` }, { status: 422 });

    const errArti = validate(arti, 1000, true);
    if (errArti) return NextResponse.json({ pesan: `Arti: ${errArti}` }, { status: 422 });

    const contohMapur = clean(formData.get("contoh_kalimat_mapur"));
    const contohIndo = clean(formData.get("contoh_kalimat_indonesia"));
    const catatan = clean(formData.get("catatan"));
    const kategoriSlug = clean(formData.get("kategori"));

    const opsional: [string, string | null, number][] = [
      ["Contoh Mapur", contohMapur, 500],
      ["Contoh Indonesia", contohIndo, 500],
      ["Catatan", catatan, 500],
    ];
    for (const [field, val, max] of opsional) {
      const err = validate(val, max);
      if (err) return NextResponse.json({ pesan: `${field}: ${err}` }, { status: 422 });
    }

    dataUsulan = {
      lema: lema!.trim(),
      kategori_slug: kategoriSlug,
      arti_indonesia: arti!.trim(),
      contoh_kalimat_mapur: contohMapur,
      contoh_kalimat_indonesia: contohIndo,
      catatan,
    };
  } else {
    // hapus
    targetId = clean(formData.get("target_entry_id"));
    if (!targetId || !UUID_RE.test(targetId)) {
      return NextResponse.json({ pesan: "ID lema target tidak valid." }, { status: 400 });
    }
    const alasan = clean(formData.get("alasan"));
    const errAlasan = validate(alasan, 500, true);
    if (errAlasan) return NextResponse.json({ pesan: `Alasan: ${errAlasan}` }, { status: 422 });
    dataUsulan = { alasan: alasan!.trim() };
  }

  // Simpan ke submissions
  try {
    await pool.query(
      `INSERT INTO submissions
         (tipe_konten, aksi, target_entry_id, data_usulan, ip_hash, status)
       VALUES ('entry', $1, $2, $3::jsonb, $4, 'pending')`,
      [aksi, targetId ?? null, JSON.stringify(dataUsulan), ipHash]
    );
  } catch {
    return NextResponse.json(
      { pesan: "Terjadi kesalahan saat menyimpan. Coba lagi nanti." },
      { status: 500 }
    );
  }

  return NextResponse.json({ sukses: true });
}
