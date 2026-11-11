import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-next-path";
import { NextResponse, type NextRequest } from "next/server";

const supportedTypes = new Set(["signup", "invite", "magiclink", "recovery", "email", "email_change"]);

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const tokenHash = url.searchParams.get("token_hash");
  const rawType = url.searchParams.get("type");
  if (!tokenHash || !rawType || !supportedTypes.has(rawType)) {
    return NextResponse.redirect(new URL("/login?error=confirm", url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: rawType as EmailOtpType,
    token_hash: tokenHash,
  });
  if (error) return NextResponse.redirect(new URL("/login?error=confirm", url.origin));

  // Password recovery tokens must reach the password update page.
  const next = rawType === "recovery"
    ? "/reset-password"
    : safeNextPath(url.searchParams.get("next"));
  return NextResponse.redirect(new URL(next, url.origin));
}
