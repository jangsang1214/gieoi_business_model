import { cookies, headers } from "next/headers";
import type { Locale } from "./i18n";

export const LOCALE_COOKIE = "prof_locale";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (value === "ko" || value === "en") return value;
  const accepted = (await headers()).get("accept-language")?.split(",")[0]?.trim().toLowerCase() || "";
  return accepted.startsWith("ko") ? "ko" : "en";
}
