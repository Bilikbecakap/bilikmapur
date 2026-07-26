import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const MIME: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const relative = segments.join("/");

  // Security: no path traversal
  const uploadsRoot = path.join(process.cwd(), "uploads");
  const fullPath = path.resolve(uploadsRoot, relative);
  if (!fullPath.startsWith(uploadsRoot)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (!fs.existsSync(fullPath)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const ext = path.extname(fullPath).toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";
  const buffer = fs.readFileSync(fullPath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
