import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const subfolder = (form.get("subfolder") as string | null) ?? undefined;

  if (!file) return NextResponse.json({ error: "Tidak ada file." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File terlalu besar (maks 20 MB)." }, { status: 413 });

  try {
    const result = await uploadFile(file, subfolder);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload gagal.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
