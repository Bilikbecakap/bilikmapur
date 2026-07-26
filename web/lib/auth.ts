import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "session";
const EXPIRY = "24h";

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET env var is not set");
  return new TextEncoder().encode(secret);
}

export async function signSession(userId: number, peran: string): Promise<string> {
  return await new SignJWT({ sub: String(userId), peran })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(key());
}

export interface SessionPayload {
  sub: string;
  peran: string;
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function sessionCookieOptions(token: string) {
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 60 * 60 * 24,
    path: "/",
  };
}
