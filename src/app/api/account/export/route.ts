import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const exportSections = [
  ["profile", "profiles", "id"],
  ["direction", "direction_profiles", "user_id"],
  ["goals", "goals", "owner_id"],
  ["records", "records", "author_id"],
  ["record_comments", "record_comments", "author_id"],
  ["proofs", "proofs", "owner_id"],
  ["teams_created", "teams", "owner_id"],
  ["team_memberships", "team_members", "user_id"],
  ["team_applications", "team_applications", "applicant_id"],
  ["opportunities_created", "opportunities", "created_by"],
  ["opportunity_applications", "opportunity_applications", "applicant_id"],
  ["collaboration_outcomes", "opportunity_outcomes", "submitted_by"],
  ["messages_sent", "messages", "sender_id"],
  ["conversations_created", "conversations", "created_by"],
  ["follows", "follows", "follower_id"],
  ["blocks", "blocks", "blocker_id"],
  ["notifications", "notifications", "recipient_id"],
  ["recommendation_feedback", "recommendation_feedback", "user_id"],
  ["activity_events", "activity_events", "user_id"],
] as const;

const MAX_ROWS_PER_SECTION = 1000;

/**
 * Personal data download. This is intentionally scoped to records authored or
 * owned by the signed-in user. It is not a claim to export every stored datum,
 * other participants' messages, inaccessible historical records or raw media
 * files. Fail closed instead of silently returning a partial archive.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await Promise.all(exportSections.map(async ([label, table, ownerColumn]) => {
    const { data, error } = await supabase.from(table).select("*")
      .eq(ownerColumn, user.id).limit(MAX_ROWS_PER_SECTION + 1);
    return { label, data, error };
  }));

  const failure = results.find(result => result.error);
  if (failure) {
    console.error("Privacy export query failed", failure.label);
    return NextResponse.json({ error: "Could not prepare the archive. Please retry." }, { status: 503 });
  }

  const sections = Object.fromEntries(results.map(result => [
    result.label, {
      rows: (result.data ?? []).slice(0, MAX_ROWS_PER_SECTION),
      truncated: (result.data?.length ?? 0) > MAX_ROWS_PER_SECTION,
    },
  ]));

  const archive = {
    product: "prof.",
    exported_at: new Date().toISOString(),
    account: { id: user.id, email: user.email ?? null, created_at: user.created_at },
    scope: "User-owned and user-authored rows readable by your account; max 1000 rows per category. This is not an exhaustive privacy data access report.",
    exclusions: "Other participants' messages, unowned TEAM content, stored media binaries, auth session logs and any records not available under your access permissions.",
    sections,
  };

  const content = JSON.stringify(archive, null, 2);
  return new Response(content, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"prof-my-data.json\"",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
