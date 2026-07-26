import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";

export { fileUrl } from "./file-url";

function r2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

function isR2Configured(): boolean {
  return !!(
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET
  );
}


const ALLOWED_TYPES: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export interface UploadResult {
  key: string;
}

export async function uploadFile(
  file: File,
  subfolder?: string
): Promise<UploadResult> {
  const mimeType = file.type;
  const ext = ALLOWED_TYPES[mimeType];
  if (!ext) throw new Error(`Tipe file tidak diizinkan: ${mimeType}`);

  const uuid = randomUUID();
  const filename = `${uuid}.${ext}`;
  const key = subfolder ? `${subfolder}/${filename}` : filename;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isR2Configured()) {
    const client = r2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );
  } else {
    const uploadsDir = path.join(process.cwd(), "uploads", subfolder ?? "");
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, filename), buffer);
  }

  return { key };
}

export async function deleteFile(key: string): Promise<void> {
  if (!key) return;
  if (isR2Configured()) {
    const client = r2Client();
    await client.send(
      new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key })
    );
  } else {
    const filePath = path.join(process.cwd(), "uploads", key);
    await fs.unlink(filePath).catch(() => {});
  }
}
