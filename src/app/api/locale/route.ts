import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE } from "@/lib/i18n-server";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  let payload: unknown;
  try { payload = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const selected = typeof payload === "object" && payload !== null &&
    "locale" in payload ? (payload as {locale: unknown}).locale : null;
  if (selected !== "ko" && selected !== "en") {
    return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
  }
  const response = NextResponse.json({ locale: selected });
  response.cookies.set(LOCALE_COOKIE, selected, {
    path: "/", httpOnly: true, sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
