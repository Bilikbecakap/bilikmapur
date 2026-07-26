import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signSession, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
  }

  const { rows } = await pool.query(
    "SELECT id, password_hash, peran FROM users WHERE email = $1",
    [email.toLowerCase().trim()]
  );

  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
  }

  const token = await signSession(user.id, user.peran);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieOptions(token));
  return res;
}
