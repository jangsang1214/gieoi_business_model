"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn" | null;

export function TeamApplyButton({
  teamId,
  userId,
  roleId,
  label = "함께하기",
  initialStatus = null,
}: {
  teamId: string;
  userId: string;
  roleId?: string;
  label?: string;
  initialStatus?: ApplicationStatus;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<ApplicationStatus>(initialStatus);
  const [error, setError] = useState("");
  const router = useRouter();

  const locked = status === "pending" || status === "accepted";
  const buttonLabel = status === "pending" ? "지원 중" : status === "accepted" ? "합류됨" : status === "rejected" ? "다시 지원" : label;

  async function submit(fd: FormData) {
    if (busy) return;
    setBusy(true);
    setError("");
    const supabase = createClient();

    let existingQuery = supabase
      .from("team_applications")
      .select("id,status")
      .eq("team_id", teamId)
      .eq("applicant_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);
    existingQuery = roleId ? existingQuery.eq("role_id", roleId) : existingQuery.is("role_id", null);
    const { data: existing } = await existingQuery.maybeSingle();

    if (existing?.status === "pending" || existing?.status === "accepted") {
      setStatus(existing.status as ApplicationStatus);
      setBusy(false);
      setOpen(false);
      return;
    }

    if (existing?.id) {
      await supabase.from("team_applications").delete().eq("id", existing.id);
    }

    const why = String(fd.get("why") || "").trim();
    const weeklyRaw = Number(fd.get("weekly_hours") || 0);
    const { error: insertError } = await supabase.from("team_applications").insert({
      team_id: teamId,
      role_id: roleId || null,
      applicant_id: userId,
      why: why || "이 TEAM에서 함께 해내고 싶습니다.",
      proof_urls: [],
      weekly_hours: weeklyRaw > 0 ? weeklyRaw : null,
      status: "pending",
    });

    setBusy(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setStatus("pending");
    setOpen(false);
    router.refresh();
  }

  return <>
    <button className="btn secondary" disabled={busy || locked} onClick={() => setOpen(true)}>{busy ? "전송 중" : buttonLabel}</button>
    {open && <div className="overlay" onMouseDown={(e) => { if (e.currentTarget === e.target) setOpen(false); }}>
      <form className="sheet application-sheet" action={submit}>
        <div className="grab" />
        <h2>{roleId ? "역할에 지원" : "TEAM에 함께하기"}</h2>
        <label className="field">한마디 <span className="optional">선택</span><textarea name="why" rows={3} placeholder="무엇을 같이 해내고 싶은지 짧게" /></label>
        <label className="field compact-field">주간 가능 시간 <span className="optional">선택</span><input name="weekly_hours" type="number" min="1" max="168" placeholder="예: 8" /></label>
        {error && <div className="error notice">{error}</div>}
        <div className="row"><button type="button" className="btn secondary full" onClick={() => setOpen(false)}>취소</button><button className="btn primary full" disabled={busy}>{busy ? "전송 중..." : "지원하기"}</button></div>
      </form>
    </div>}
  </>;
}
