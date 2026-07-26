import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret) throw new Error("SESSION_SECRET not set");
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
