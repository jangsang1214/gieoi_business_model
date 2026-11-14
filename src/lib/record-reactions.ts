import type { SupabaseClient } from "@supabase/supabase-js";

// HEAD counts are not constrained by the Data API's returned-row cap.
// Resolve the viewer separately so a popular record still supports unlike.
export async function recordReactions(supabase: SupabaseClient, recordIds: string[], userId: string) {
  const results = await Promise.all(recordIds.map(async recordId => {
    const [total, mine] = await Promise.all([
      supabase.from("record_likes").select("record_id", { count: "exact", head: true }).eq("record_id", recordId),
      supabase.from("record_likes").select("record_id").eq("record_id", recordId).eq("user_id", userId).maybeSingle(),
    ]);
    return { recordId, count: total.count ?? 0, liked: Boolean(mine.data), unavailable: Boolean(total.error || mine.error || total.count === null) };
  }));
  return new Map(results.map(result => [result.recordId, result]));
}
