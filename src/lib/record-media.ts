export type RecordImage = { path: string; type?: string };

const safePath = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp|gif)$/i;

export function createMediaUrl(path: string): string {
  if (typeof path !== "string" || !safePath.test(path)) return "";
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/record-media/${path}`;
}
