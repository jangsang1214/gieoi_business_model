"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function TeamApplicationReview({ applicationId, teamId, applicantId, roleName }: { applicationId: string; teamId: string; applicantId: string; roleName: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function review(status: "accepted" | "rejected") {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("team_applications").update({
      status,
      reviewed_at: new Date().toISOString(),
    }).eq("id", applicationId);

    if (!error && status === "accepted") {
      await supabase.from("team_members").insert({
        team_id: teamId,
        user_id: applicantId,
        role_name: roleName || "Member",
        status: "active",
        joined_at: new Date().toISOString(),
      });
    }
    setBusy(false);
    router.refresh();
  }

  return <div className="row application-actions"><button className="btn secondary" disabled={busy} onClick={() => review("rejected")}>거절</button><button className="btn primary" disabled={busy} onClick={() => review("accepted")}>합류</button></div>;
}
