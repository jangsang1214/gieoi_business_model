"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function TeamApplicationReview({ applicationId, teamId, applicantId, roleName }: { applicationId: string; teamId: string; applicantId: string; roleName: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function review(status: "accepted" | "rejected") {
    if (busy) return;
    setBusy(true);
    setError("");
    const supabase = createClient();

    const { error: reviewError } = await supabase.from("team_applications").update({
      status,
      reviewed_at: new Date().toISOString(),
    }).eq("id", applicationId);

    if (reviewError) {
      setError(reviewError.message);
      setBusy(false);
      return;
    }

    if (status === "accepted") {
      const { error: memberError } = await supabase.from("team_members").upsert({
        team_id: teamId,
        user_id: applicantId,
        role_name: roleName || "Member",
        status: "active",
        joined_at: new Date().toISOString(),
        left_at: null,
      }, { onConflict: "team_id,user_id" });

      if (memberError) {
        await supabase.from("team_applications").update({ status: "pending", reviewed_at: null }).eq("id", applicationId);
        setError(memberError.message);
        setBusy(false);
        return;
      }
    }

    setBusy(false);
    router.refresh();
  }

  return <div><div className="row application-actions"><button className="btn secondary" disabled={busy} onClick={() => review("rejected")}>거절</button><button className="btn primary" disabled={busy} onClick={() => review("accepted")}>{busy ? "처리 중" : "합류"}</button></div>{error && <div className="error notice compact-notice">{error}</div>}</div>;
}
