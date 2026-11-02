"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function TeamApplyButton({ teamId, userId, roleId, label = "함께하기" }: { teamId: string; userId: string; roleId?: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  return <button className="btn secondary" disabled={busy || sent} onClick={async () => {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("team_applications").insert({
      team_id: teamId,
      role_id: roleId || null,
      applicant_id: userId,
      why: "이 TEAM에서 함께 해내고 싶습니다.",
      proof_urls: [],
      status: "pending",
    });
    setBusy(false);
    if (!error) setSent(true);
    router.refresh();
  }}>{busy ? "전송 중" : sent ? "지원됨" : label}</button>;
}
