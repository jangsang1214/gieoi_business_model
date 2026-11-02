"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function TeamGoalForm({ teamId, userId, domain }: { teamId: string; userId: string; domain: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(fd: FormData) {
    const supabase = createClient();
    const { error } = await supabase.from("goals").insert({
      owner_id: userId,
      team_id: teamId,
      domain,
      title: String(fd.get("title") || "").trim(),
      why: String(fd.get("why") || "").trim() || "TEAM Goal",
      target_date: String(fd.get("target_date") || "") || null,
      visibility: "public",
      status: "active",
    });
    if (error) return setError(error.message);
    setOpen(false);
    router.refresh();
  }

  return <>
    <button className="btn secondary" onClick={() => setOpen(true)}>Goal 추가</button>
    {open && <div className="overlay"><form className="sheet" action={submit}>
      <div className="grab" />
      <h2>TEAM Goal</h2>
      <label className="field">무엇을 함께 해낼 건가요?<input name="title" required /></label>
      <label className="field">메모 <span className="optional">선택</span><textarea name="why" rows={3} /></label>
      <label className="field">목표일 <span className="optional">선택</span><input name="target_date" type="date" /></label>
      {error && <div className="error notice">{error}</div>}
      <div className="row"><button type="button" className="btn secondary full" onClick={() => setOpen(false)}>취소</button><button className="btn primary full">추가</button></div>
    </form></div>}
  </>;
}
