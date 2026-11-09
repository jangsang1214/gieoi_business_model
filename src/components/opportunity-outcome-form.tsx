"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Outcome = { id: string; title: string; summary: string; status: string; proof_id: string | null };
type Proof = { id: string; title: string };

const statusLabel: Record<string,string> = {
  pending: "모집자의 확인을 기다리고 있습니다.",
  confirmed: "양측이 협업 결과를 확인했습니다.",
  declined: "상대방이 결과 확인을 승인하지 않았습니다.",
};

export function OpportunityOutcomeForm({ userId, applicationId, proofs, outcome }: {
  userId: string; applicationId: string; proofs: Proof[]; outcome: Outcome | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [proofId, setProofId] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim(), cleanSummary = summary.trim();
    if (busy || cleanTitle.length < 3 || cleanSummary.length < 20) return;
    setBusy(true); setError("");
    const { error: insertError } = await createClient().from("opportunity_outcomes").insert({
      application_id: applicationId,
      submitted_by: userId,
      title: cleanTitle,
      summary: cleanSummary,
      proof_id: proofId || null,
    });
    setBusy(false);
    if (insertError) {
      setError("협업 결과를 제출하지 못했습니다. 양측 연결 상태와 내용을 확인해 주세요.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (outcome) return <section className="opportunity-outcome-box" aria-label="협업 결과">
    <span className="mini-label">COLLABORATION OUTCOME</span>
    <h3>{outcome.title}</h3>
    <p>{outcome.summary}</p>
    <div className="meta">{statusLabel[outcome.status] ?? outcome.status}</div>
    {outcome.proof_id && <a className="inline-action" href={`/proof/${outcome.proof_id}`}>연결된 공개 Proof →</a>}
    <p className="meta">상호 확인은 협업 사실에 대한 상대방의 확인이며, 기관이 검증한 자격이나 성과를 뜻하지 않습니다.</p>
  </section>;

  return <>
    <button type="button" className="btn secondary" onClick={() => setOpen(true)}>협업 결과 기록</button>
    {open && <div className="overlay" onMouseDown={event => {
      if (event.currentTarget === event.target && !busy) setOpen(false);
    }}>
      <form className="sheet" onSubmit={submit}>
        <div className="grab"/>
        <h2>함께 만들어낸 결과</h2>
        <p className="meta">지원이 수락된 기회에서만 기록할 수 있습니다. 모집자가 확인해야 상호 확인 상태가 됩니다.</p>
        <label className="field"><span>결과 제목</span>
          <input value={title} required minLength={3} maxLength={120}
            onChange={e => setTitle(e.target.value)} disabled={busy}
            placeholder="예: 팀 프로젝트 첫 버전 출시"/>
        </label>
        <label className="field"><span>어떤 일을 함께 했나요?</span>
          <textarea value={summary} required minLength={20} maxLength={2000} rows={5}
            onChange={e => setSummary(e.target.value)} disabled={busy}
            placeholder="본인이 기여한 내용과 함께 달성한 결과를 구체적으로 작성해 주세요."/>
        </label>
        <label className="field"><span>내 공개 Proof 연결 (선택)</span>
          <select value={proofId} onChange={e => setProofId(e.target.value)} disabled={busy}>
            <option value="">연결하지 않음</option>
            {proofs.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </label>
        <p className="meta">한 지원에는 결과 확인 요청을 한 번만 보낼 수 있습니다. 양측 확인 전에는 인증된 성과로 표시되지 않습니다.</p>
        {error && <p role="alert" className="error notice">{error}</p>}
        <div className="row">
          <button type="button" className="btn secondary full" disabled={busy} onClick={() => setOpen(false)}>취소</button>
          <button type="submit" className="btn primary full" disabled={busy || title.trim().length < 3 || summary.trim().length < 20}>{busy?"제출 중...":"확인 요청 보내기"}</button>
        </div>
      </form>
    </div>}
  </>;
}
