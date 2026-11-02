"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RecommendationActions({
  userId,
  targetType,
  targetId,
  initialState,
}: {
  userId: string;
  targetType: "team" | "opportunity" | "profile";
  targetId: string;
  initialState?: "saved" | "dismissed" | null;
}) {
  const [state, setState] = useState(initialState ?? null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function setFeedback(next: "saved" | "dismissed" | null) {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();

    if (next === null) {
      await supabase
        .from("recommendation_feedback")
        .delete()
        .eq("user_id", userId)
        .eq("target_type", targetType)
        .eq("target_id", targetId);
    } else {
      await supabase.from("recommendation_feedback").upsert({
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
        state: next,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,target_type,target_id" });
    }

    setState(next);
    setBusy(false);
    if (next === "dismissed") router.refresh();
  }

  return (
    <div className="recommendation-actions" aria-label="추천 관리">
      <button type="button" disabled={busy} className={state === "saved" ? "saved" : ""} onClick={() => setFeedback(state === "saved" ? null : "saved")}>
        {state === "saved" ? "저장됨" : "저장"}
      </button>
      <button type="button" disabled={busy} onClick={() => setFeedback("dismissed")}>관심 없음</button>
    </div>
  );
}
