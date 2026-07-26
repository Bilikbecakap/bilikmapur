import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_tok";
const MAX_AGE = 60 * 60 * 24; // 24 jam

export async function POST(req: NextRequest) {
  const { secret } = await req.json();

  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, process.env.ADMIN_SECRET, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: MAX_AGE,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}
