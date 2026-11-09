"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { trackActivity } from "@/components/activity-tracker";

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
  const [error, setError] = useState("");
  const router = useRouter();

  async function setFeedback(next: "saved" | "dismissed" | null) {
    if (busy) return;
    setBusy(true);
    setError("");
    const supabase = createClient();
    let feedbackError;

    if (next === null) {
      const { error } = await supabase
        .from("recommendation_feedback")
        .delete()
        .eq("user_id", userId)
        .eq("target_type", targetType)
        .eq("target_id", targetId);
      feedbackError = error;
    } else {
      const { error } = await supabase.from("recommendation_feedback").upsert({
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
        state: next,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,target_type,target_id" });
      feedbackError = error;
    }

    if (feedbackError) {
      setError("저장 상태를 변경하지 못했어요. 다시 시도해 주세요.");
      setBusy(false);
      return;
    }

    if (next === "saved" && (targetType === "team" || targetType === "profile")) {
      void trackActivity(userId, "recommendation_save", targetType, targetId, "recommendation");
    }
    setState(next);
    setBusy(false);
    // Saved/matched views are server-filtered; refresh after save, unsave or dismiss.
    router.refresh();
  }

  return (
    <div className="recommendation-actions" aria-label="추천 관리">
      <button type="button" disabled={busy} className={state === "saved" ? "saved" : ""} onClick={() => setFeedback(state === "saved" ? null : "saved")}>
        {state === "saved" ? "저장됨" : "저장"}
      </button>
      <button type="button" disabled={busy} onClick={() => setFeedback("dismissed")}>관심 없음</button>
      {error && <span className="error" role="alert">{error}</span>}
    </div>
  );
}
