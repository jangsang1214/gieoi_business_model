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
    const why = String(fd.get("why") || "").trim();
    const weeklyRaw = Number(fd.get("weekly_hours") || 0);
    const { data, error: insertError } = await createClient().rpc("submit_team_application", {
      p_team_id: teamId,
      p_role_id: roleId || null,
      p_why: why || null,
      p_weekly_hours: Number.isFinite(weeklyRaw) && weeklyRaw > 0 ? weeklyRaw : null,
    });

    setBusy(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setStatus(data?.status === "accepted" ? "accepted" : "pending");
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
