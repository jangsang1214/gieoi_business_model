"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function TeamApplicationReview({ applicationId }: { applicationId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function review(status: "accepted" | "rejected") {
    if (busy) return;
    setBusy(true);
    setError("");
    const supabase = createClient();

    // Database BEFORE UPDATE trigger validates ownership and performs membership upsert atomically.
    const { data: updated, error: reviewError } = await supabase.from("team_applications").update({ status }).eq("id", applicationId).eq("status", "pending").select("id").maybeSingle();

    if (reviewError || !updated) {
      setError(reviewError?.message || "이미 처리된 지원입니다. 화면을 새로고침해 주세요.");
      setBusy(false);
      return;
    }

    // No second client write: either application and member both commit or both roll back.

    setBusy(false);
    router.refresh();
  }

  return <div><div className="row application-actions"><button className="btn secondary" disabled={busy} onClick={() => review("rejected")}>거절</button><button className="btn primary" disabled={busy} onClick={() => review("accepted")}>{busy ? "처리 중" : "합류"}</button></div>{error && <div className="error notice compact-notice">{error}</div>}</div>;
}
