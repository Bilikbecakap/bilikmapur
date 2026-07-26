/**
 * Rakit URL file dari key.
 * Aman dipakai di client component maupun server component.
 *
 * Production: R2_PUBLIC_URL/key (set NEXT_PUBLIC_R2_PUBLIC_URL di env)
 * Lokal dev:  /api/files/key  (dilayani dari ./uploads/)
 */
export function fileUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  const base =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_R2_PUBLIC_URL
      : (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? process.env.R2_PUBLIC_URL);
  if (base) return `${base}/${key}`;
  return `/api/files/${key}`;
}
