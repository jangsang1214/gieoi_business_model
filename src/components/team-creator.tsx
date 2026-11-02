"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function TeamCreator({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(fd: FormData) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("teams")
      .insert({
        owner_id: userId,
        name: String(fd.get("name") || "").trim(),
        mission: String(fd.get("mission") || "").trim(),
        domain: String(fd.get("domain") || "business"),
        current_stage: String(fd.get("current_stage") || "").trim() || null,
        join_mode: "application",
      })
      .select("id")
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    if (data) {
      await supabase.from("team_members").insert({
        team_id: data.id,
        user_id: userId,
        role_name: "Founder",
        status: "active",
        joined_at: new Date().toISOString(),
      });
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button className="btn primary" onClick={() => setOpen(true)}>TEAM 만들기</button>
      {open && (
        <div className="overlay">
          <form className="sheet team-create-v4" action={submit}>
            <div className="grab" />
            <h2>새 TEAM</h2>
            <label className="field">이름<input name="name" placeholder="TEAM 이름" required /></label>
            <label className="field">분야<select name="domain"><option value="business">BUSINESS</option><option value="workout">WORKOUT</option><option value="create">CREATE</option><option value="study">STUDY</option><option value="career">CAREER</option><option value="lifestyle">LIFESTYLE</option></select></label>
            <label className="field">무엇을 함께 해낼 건가요?<textarea name="mission" rows={4} placeholder="창업, 대회, 연구, 작품, 운동 목표 등 무엇이든" required /></label>
            <label className="field">지금 단계 <span className="optional">선택</span><input name="current_stage" placeholder="예: 아이디어, 준비 중, MVP, 출전 준비" /></label>
            {error && <div className="error">{error}</div>}
            <div className="row"><button type="button" className="btn secondary full" onClick={() => setOpen(false)}>취소</button><button className="btn primary full">생성</button></div>
          </form>
        </div>
      )}
    </>
  );
}
