/**
 * Only accept same-origin application paths from email links.
 * A raw or encoded absolute URL must never determine an auth redirect.
 */
export function safeNextPath(input: string | null | undefined, fallback = "/"): string {
  if (!input || !input.startsWith("/") || input.startsWith("//") ||
      input.includes("\\") || /[\u0000-\u001f\u007f]/.test(input)) return fallback;
  try {
    const base = "https://prof.local.invalid";
    const target = new URL(input, base);
    return target.origin === base && target.pathname.startsWith("/")
      ? target.pathname + target.search + target.hash
      : fallback;
  } catch {
    return fallback;
  }
}
