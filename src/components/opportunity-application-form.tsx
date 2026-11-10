"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Locale, messagesFor } from "@/lib/i18n";

type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn";
type Props = {
  userId: string;
  opportunityId: string;
  application: { id: string; status: ApplicationStatus } | null;
  proofs: { id: string; title: string }[];
  locale?: Locale;
};

const labels: Record<ApplicationStatus, string> = {
  pending: "심사 대기 중",
  accepted: "수락됨",
  rejected: "선정되지 않음",
  withdrawn: "지원 철회됨",
};

export function OpportunityApplicationForm({ userId, opportunityId, application, proofs, locale = "ko" }: Props) {
  const en = locale === "en";
  const t = messagesFor(locale);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [note, setNote] = useState("");
  const [proofId, setProofId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = note.trim();
    if (busy || value.length < 10 || value.length > 1500 || application) return;
    setBusy(true);
    setError("");

    const { error: insertError } = await createClient().from("opportunity_applications").insert({
      opportunity_id: opportunityId,
      applicant_id: userId,
      note: value,
      proof_id: proofId || null,
      status: "pending",
    });
    setBusy(false);
    if (insertError) {
      setError(insertError.code === "23505"
        ? (en ? "You have already applied. Check My applications." : "이미 지원한 기회입니다. 지원 현황을 확인해 주세요.")
        : (en ? "Could not submit your application. Please try again." : "지원서를 제출하지 못했습니다. 내용을 확인하고 다시 시도해 주세요."));
      return;
    }

    setOpen(false);
    setNote("");
    router.refresh();
  }

  async function withdraw() {
    if (busy || !application || application.status !== "pending") return;
    setBusy(true);
    setError("");
    const { data, error: updateError } = await createClient()
      .from("opportunity_applications")
      .update({ status: "withdrawn" })
      .eq("id", application.id)
      .eq("applicant_id", userId)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    setBusy(false);
    setConfirmWithdraw(false);
    if (updateError || !data) {
      setError(en ? "This application has changed or cannot be withdrawn." : "지원 상태가 변경되었거나 철회할 수 없습니다. 새로고침 후 확인해 주세요.");
      router.refresh();
      return;
    }
    router.refresh();
  }

  if (application) {
    return <div className="opportunity-application-state">
      <div className="stage-pill">{en ? ({pending: "Pending review", accepted: "Accepted", rejected: "Not selected", withdrawn: "Withdrawn"} as Record<ApplicationStatus,string>)[application.status] : labels[application.status]}</div>
      {application.status === "pending" && <>
        {!confirmWithdraw
          ? <button type="button" className="btn secondary" onClick={() => setConfirmWithdraw(true)}>{en ? "Withdraw application" : "지원 철회"}</button>
          : <div className="opportunity-application-confirm">
            <p>{en ? "Withdraw this application? You cannot apply again in this version." : "정말 철회할까요? 현재 버전에서는 철회 후 다시 지원할 수 없습니다."}</p>
            <button className="btn secondary" type="button" disabled={busy} onClick={() => setConfirmWithdraw(false)}>{en ? "Keep it" : "유지"}</button>
            <button className="btn secondary" type="button" disabled={busy} onClick={withdraw}>{busy ? (en ? "Working..." : "처리 중...") : (en ? "Confirm withdrawal" : "철회 확인")}</button>
          </div>}
      </>}
      {error && <p role="alert" className="error notice">{error}</p>}
    </div>;
  }

  return <>
    <button type="button" className="btn primary" onClick={() => { setError(""); setOpen(true); }}>
      {t.opportunity.apply}
    </button>
    {open && <div className="overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) setOpen(false);
    }}>
      <form className="sheet" onSubmit={apply}>
        <div className="grab" />
        <h2>{en ? "Apply to this opportunity" : "기회에 정식 지원하기"}</h2>
        <p className="meta">{en ? "Only the organizer can review your application. Unlike a message inquiry, an application has an acceptance status." : "지원 내용은 이 기회 등록자에게만 전달됩니다. 문의 메시지와 달리 수락·거절 상태가 기록됩니다."}</p>
        <label className="field">
          <span>{en ? "Why are you applying? What can you contribute?" : "지원 이유와 기여할 수 있는 일"}</span>
          <textarea required minLength={10} maxLength={1500} rows={6}
            placeholder={en ? "Describe your goals, experience and how you can contribute." : "어떤 목표로 참여하는지, 무엇을 해왔는지, 어떻게 기여할 수 있는지 작성해 주세요."}
            value={note} onChange={(event) => setNote(event.target.value)} disabled={busy}/>
        </label>
        <label className="field">
          <span>{en ? "Link related Proof (optional, public only)" : "관련 Proof 연결 (선택 · 공개된 Proof만)"}</span>
          <select value={proofId} onChange={(event) => setProofId(event.target.value)} disabled={busy}>
            <option value="">{en ? "No Proof linked" : "연결하지 않음"}</option>
            {proofs.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </label>
        <p className="meta">{en ? "One application per opportunity. Do not include sensitive personal information." : "한 기회에는 한 번만 지원할 수 있습니다. 개인정보·민감정보는 지원서에 적지 마세요."}</p>
        {error && <p role="alert" className="error notice">{error}</p>}
        <div className="row">
          <button type="button" className="btn secondary full" disabled={busy} onClick={() => setOpen(false)}>{t.common.cancel}</button>
          <button className="btn primary full" type="submit" disabled={busy || note.trim().length < 10}>
            {busy ? (en ? "Submitting..." : "제출 중...") : (en ? "Submit application" : "지원서 제출")}
          </button>
        </div>
      </form>
    </div>}
  </>;
}
