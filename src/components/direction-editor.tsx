"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Direction = {
  future_tags?: string[] | null;
  skill_tags?: string[] | null;
  desired_complements?: string[] | null;
  weekly_commitment_hours?: number | null;
  stage?: string | null;
} | null;

const parseTags = (value: FormDataEntryValue | null) =>
  [...new Set(String(value ?? "").split(",").map(x => x.trim().toLowerCase()).filter(Boolean))].slice(0, 12);

export function DirectionEditor({ userId, initial }: { userId: string; initial: Direction }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [exists, setExists] = useState(Boolean(initial));
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const rawHours = String(form.get("hours") ?? "").trim();
    const hours = rawHours ? Number(rawHours) : null;
    if (hours !== null && (!Number.isFinite(hours) || hours < 0 || hours > 168)) {
      setError("주간 투입 가능 시간은 0~168시간 사이로 입력해 주세요.");
      return;
    }

    // Only change fields this editor owns. Do not overwrite preferred_domains,
    // verification counts, activity stats or open_to_opportunity.
    const patch = {
      future_tags: parseTags(form.get("future")),
      skill_tags: parseTags(form.get("skills")),
      desired_complements: parseTags(form.get("complements")),
      weekly_commitment_hours: hours,
      stage: String(form.get("stage") ?? "").trim().slice(0, 80) || null,
    };
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      if (exists) {
        const { data, error: updateError } = await supabase.from("direction_profiles")
          .update(patch).eq("user_id", userId).select("user_id").maybeSingle();
        if (updateError || !data) {
          setError("방향을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
          return;
        }
      } else {
        const { error: insertError } = await supabase.from("direction_profiles")
          .insert({ user_id: userId, ...patch });
        if (insertError) {
          setError("방향을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
          return;
        }
        setExists(true);
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("연결에 문제가 생겼습니다. 입력 내용은 유지됩니다.");
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button type="button" className="btn secondary" onClick={() => {
      setError(""); setOpen(true);
    }}>방향 설정</button>
    {open && <div className="overlay">
      <form className="sheet" onSubmit={submit}>
        <div className="grab"/>
        <h2>내가 향하는 방향</h2>
        <p>이 데이터가 TEAM/Opportunity 추천의 핵심이 됩니다.</p>
        <label className="field">Future tags
          <input name="future" defaultValue={(initial?.future_tags ?? []).join(", ")}
            placeholder="ai, 0to1, product, brand" disabled={busy}/>
        </label>
        <label className="field">내 역량
          <input name="skills" defaultValue={(initial?.skill_tags ?? []).join(", ")}
            placeholder="product, brand, research" disabled={busy}/>
        </label>
        <label className="field">보완받고 싶은 역량
          <input name="complements" defaultValue={(initial?.desired_complements ?? []).join(", ")}
            placeholder="backend, infra, design" disabled={busy}/>
        </label>
        <label className="field">주간 투입 가능 시간
          <input type="number" name="hours" min="0" max="168" step="1"
            defaultValue={initial?.weekly_commitment_hours ?? ""}
            disabled={busy}/>
        </label>
        <label className="field">현재 Stage
          <input name="stage" defaultValue={initial?.stage ?? ""} maxLength={80}
            placeholder="0to1" disabled={busy}/>
        </label>
        {error && <p className="error notice" role="alert">{error}</p>}
        <div className="row">
          <button type="button" className="btn secondary full" disabled={busy}
            onClick={() => setOpen(false)}>취소</button>
          <button type="submit" className="btn primary full" disabled={busy}>
            {busy ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </div>}
  </>;
}
