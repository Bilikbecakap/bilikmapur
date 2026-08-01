import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_ONLY_PREFIXES = ["/admin/users", "/admin/sampah", "/admin/log-aktivitas"];

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
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

    if (ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p)) && payload.peran !== "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
