"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function OpportunityOutcomeReview({ outcomeId }: { outcomeId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState<"confirmed" | "declined" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function decide() {
    if (!confirming || busy) return;
    setBusy(true); setError("");
    const { data, error: updateError } = await createClient().from("opportunity_outcomes")
      .update({ status: confirming }).eq("id",outcomeId).eq("status","pending")
      .select("id").maybeSingle();
    setBusy(false);
    if (!data || updateError) {
      setError("요청이 이미 처리되었거나 확인 권한이 없습니다.");
    }
    setConfirming(null);
    router.refresh();
  }

  return <div className="opportunity-review-actions">
    {!confirming ? <>
      <button type="button" className="btn primary" disabled={busy} onClick={() => setConfirming("confirmed")}>결과 확인</button>
      <button type="button" className="btn secondary" disabled={busy} onClick={() => setConfirming("declined")}>확인 거절</button>
    </> : <>
      <p className="meta">{confirming === "confirmed"
        ? "상대방이 제출한 협업 결과를 실제로 확인했나요? 완료 후 변경할 수 없습니다."
        : "결과 확인을 거절할까요? 완료 후 변경할 수 없습니다."}</p>
      <button type="button" className="btn secondary" disabled={busy} onClick={() => setConfirming(null)}>취소</button>
      <button type="button" className="btn primary" disabled={busy} onClick={decide}>{busy?"처리 중...":"결정 확정"}</button>
    </>}
    {error && <p className="error notice" role="alert">{error}</p>}
  </div>;
}
