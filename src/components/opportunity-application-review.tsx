"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function OpportunityApplicationReview({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function decide(nextStatus: "accepted" | "rejected") {
    if (busy) return;
    setBusy(true);
    setError("");
    const { data, error: updateError } = await createClient()
      .from("opportunity_applications")
      .update({ status: nextStatus })
      .eq("id", applicationId)
      .eq("status", "pending")
      .select("id,status")
      .maybeSingle();
    setBusy(false);
    if (updateError || !data) {
      setError("이미 심사되었거나 처리 권한이 없습니다. 상태를 다시 확인해 주세요.");
    }
    router.refresh();
  }

  return <div className="opportunity-review-actions">
    <button type="button" className="btn primary" disabled={busy} onClick={() => decide("accepted")}>
      수락
    </button>
    <button type="button" className="btn secondary" disabled={busy} onClick={() => decide("rejected")}>
      거절
    </button>
    {error && <p role="alert" className="error notice">{error}</p>}
  </div>;
}
