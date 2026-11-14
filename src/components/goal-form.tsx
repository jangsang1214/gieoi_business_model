"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const allowedDomains = new Set(["business", "workout", "create", "study", "career", "lifestyle"]);

export function GoalForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const values = new FormData(event.currentTarget);
    const title = String(values.get("title") ?? "").trim();
    const domain = String(values.get("domain") ?? "");
    if (!title || title.length > 120 || !allowedDomains.has(domain)) {
      setError("목표 제목과 분야를 확인해 주세요.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const { error: insertError } = await createClient().from("goals").insert({
        owner_id: userId,
        domain,
        title,
        why: String(values.get("why") ?? "").trim() || null,
        visibility: "public",
        status: "active",
      });
      if (insertError) {
        setError("Goal을 저장하지 못했습니다. 입력 내용은 유지되니 다시 시도해 주세요.");
        return;
      }
      setDraft("");
      setOpen(false);
      router.refresh();
    } catch {
      setError("연결에 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button type="button" className="btn primary" onClick={() => { setError(""); setOpen(true); }}>
      Goal 추가
    </button>
    {open && <div className="overlay">
      <form className="sheet goal-v4" onSubmit={submit}>
        <div className="grab" />
        <h2>새 Goal</h2>
        <label className="field">무엇을 이루고 싶나요?
          <input name="title" placeholder="예: 첫 제품 출시, 대회 본선 진출" maxLength={120} required disabled={busy}
            value={draft} onChange={event=>setDraft(event.target.value)}/>
        </label>
        <div className="onboarding-examples" aria-label="목표 예시">
          {["첫 프로젝트 출시하기","일주일에 3번 운동하기","한 달간 매일 공부하기"].map(example=><button
            type="button" className="btn secondary" key={example} onClick={()=>setDraft(example)} disabled={busy}>{example}</button>)}
        </div>
        <label className="field">분야
          <select name="domain" disabled={busy}>
            <option value="business">BUSINESS</option>
            <option value="workout">WORKOUT</option>
            <option value="create">CREATE</option>
            <option value="study">STUDY</option>
            <option value="career">CAREER</option>
            <option value="lifestyle">LIFESTYLE</option>
          </select>
        </label>
        <label className="field">메모 <span className="optional">선택</span>
          <textarea name="why" rows={3} maxLength={2000} disabled={busy}
            placeholder="왜 이걸 하고 싶은지 짧게 남겨도 됩니다."/>
        </label>
        {error && <p role="alert" className="error notice">{error}</p>}
        <div className="row">
          <button type="button" className="btn secondary full" disabled={busy}
            onClick={() => setOpen(false)}>취소</button>
          <button type="submit" className="btn primary full" disabled={busy}>
            {busy ? "저장 중..." : "추가"}
          </button>
        </div>
      </form>
    </div>}
  </>;
}
