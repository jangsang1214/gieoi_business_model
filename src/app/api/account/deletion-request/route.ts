import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Requests a reviewed deletion. This does NOT delete an Auth account or
 * associated TEAM/Opportunity records. Account deletion may require a human
 * decision on third-party collaboration records and references.
 */
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") || 0) > 1024) {
    return NextResponse.json({ error: "Invalid request" }, { status: 413 });
  }

  let body: { confirmation?: unknown } | null;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body || body.confirmation !== "REQUEST_DELETION") {
    return NextResponse.json({ error: "Confirmation required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing, error: readError } = await supabase
    .from("account_deletion_requests").select("id,status,created_at")
    .eq("user_id", user.id).eq("status","pending")
    .limit(1).maybeSingle();
  if (readError) {
    return NextResponse.json({ error: "Deletion requests are temporarily unavailable." }, { status: 503 });
  }
  if (existing) return NextResponse.json({ request: existing, already_pending: true });

  const { data: created, error: insertError } = await supabase.from("account_deletion_requests")
    .insert({ user_id: user.id })
    .select("id,status,created_at")
    .single();

  if (insertError || !created) {
    // Unique pending-request index may reject a simultaneous submit.
    const { data: pending } = await supabase
      .from("account_deletion_requests").select("id,status,created_at")
      .eq("user_id", user.id).eq("status", "pending")
      .limit(1).maybeSingle();
    if (pending) return NextResponse.json({ request: pending, already_pending: true });
    return NextResponse.json({ error: "Could not submit the request." }, { status: 503 });
  }

  return NextResponse.json({ request: created }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
