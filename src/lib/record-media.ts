export type RecordImage = { path: string; type?: string };

const safePath = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp|gif)$/i;

export function createMediaUrl(path: string): string {
  if (typeof path !== "string" || !safePath.test(path)) return "";
  return "/api/record-media?path=" + encodeURIComponent(path);
}
