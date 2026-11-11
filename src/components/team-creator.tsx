"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const domains = new Set(["business", "workout", "create", "study", "career", "lifestyle"]);

export function TeamCreator({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [partialTeam, setPartialTeam] = useState<string | null>(null);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const fd = new FormData(event.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const mission = String(fd.get("mission") ?? "").trim();
    const domain = String(fd.get("domain") ?? "");
    if (!name || !mission || name.length > 100 || mission.length > 2000 || !domains.has(domain)) {
      setError("TEAM 이름, 분야, 목표를 다시 확인해 주세요.");
      return;
    }

    setBusy(true);
    setError("");
    setPartialTeam(null);
    const supabase = createClient();
    let createdId: string | null = null;
    try {
      // Keep an incomplete TEAM out of public discovery until its founder is
      // registered. The client uses compensating rollback on failure; a future
      // DB transaction would provide stronger guarantees.
      const { data: created, error: createError } = await supabase.from("teams")
        .insert({
          owner_id: userId,
          name,
          mission,
          domain,
          current_stage: String(fd.get("current_stage") ?? "").trim().slice(0, 80) || null,
          join_mode: "application",
          discoverable: false,
        }).select("id").single();
      if (createError || !created) {
        setError("TEAM을 생성하지 못했습니다. 다시 시도해 주세요.");
        return;
      }
      createdId = created.id;
      const { error: memberError } = await supabase.from("team_members").insert({
        team_id: createdId,
        user_id: userId,
        role_name: "Founder",
        status: "active",
        joined_at: new Date().toISOString(),
      });
      if (memberError) throw new Error("founder-membership");

      const { data: visible, error: publishError } = await supabase.from("teams")
        .update({ discoverable: true })
        .eq("id", createdId).eq("owner_id", userId)
        .select("id").maybeSingle();
      if (publishError || !visible) throw new Error("publish-team");

      setOpen(false);
      router.push(`/team/${createdId}`);
      router.refresh();
    } catch {
      if (createdId) {
        const { data: removed, error: cleanupError } = await supabase.from("teams")
          .delete().eq("id", createdId).eq("owner_id", userId)
          .select("id").maybeSingle();
        if (cleanupError || !removed) {
          setPartialTeam(createdId);
          setError("TEAM은 생성됐지만 초기 설정이 완료되지 않았습니다. TEAM 페이지에서 상태를 확인해 주세요.");
        } else {
          setError("TEAM 초기 설정에 실패해 불완전한 TEAM을 정리했어요. 다시 시도해 주세요.");
        }
      } else {
        setError("연결에 문제가 생겼습니다. 다시 시도해 주세요.");
      }
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button type="button" className="btn primary" onClick={() => {
      setError(""); setPartialTeam(null); setOpen(true);
    }}>TEAM 만들기</button>
    {open && <div className="overlay">
      <form className="sheet team-create-v4" onSubmit={submit}>
        <div className="grab"/>
        <h2>새 TEAM</h2>
        <label className="field">이름
          <input name="name" placeholder="TEAM 이름" required maxLength={100} disabled={busy}/>
        </label>
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
        <label className="field">무엇을 함께 해낼 건가요?
          <textarea name="mission" rows={4} maxLength={2000} required disabled={busy}
            placeholder="창업, 대회, 연구, 작품, 운동 목표 등 무엇이든"/>
        </label>
        <label className="field">지금 단계 <span className="optional">선택</span>
          <input name="current_stage" maxLength={80} disabled={busy}
            placeholder="예: 아이디어, 준비 중, MVP, 출전 준비"/>
        </label>
        {error && <p className="error notice" role="alert">{error}</p>}
        {partialTeam && <Link href={`/team/${partialTeam}`} className="inline-action">생성된 TEAM 확인 →</Link>}
        <div className="row">
          <button type="button" className="btn secondary full" disabled={busy}
            onClick={() => setOpen(false)}>취소</button>
          <button type="submit" className="btn primary full" disabled={busy}>
            {busy ? "생성 중..." : "생성"}
          </button>
        </div>
      </form>
    </div>}
  </>;
}
