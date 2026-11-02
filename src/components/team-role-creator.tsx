"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function TeamRoleCreator({ teamId }: { teamId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(fd: FormData) {
    const supabase = createClient();
    const skills = String(fd.get("skills") || "").split(",").map((x) => x.trim()).filter(Boolean);
    const { error } = await supabase.from("team_roles").insert({
      team_id: teamId,
      title: String(fd.get("title") || "").trim(),
      description: String(fd.get("description") || "").trim(),
      required_skills: skills,
      weekly_hours_min: Number(fd.get("weekly_hours_min") || 0) || null,
      weekly_hours_max: Number(fd.get("weekly_hours_max") || 0) || null,
      is_open: true,
    });
    if (error) return setError(error.message);
    setOpen(false);
    router.refresh();
  }

  return <>
    <button className="btn secondary" onClick={() => setOpen(true)}>역할 추가</button>
    {open && <div className="overlay"><form className="sheet" action={submit}>
      <div className="grab" />
      <h2>모집 역할</h2>
      <label className="field">역할<input name="title" placeholder="예: Frontend, Designer, Research" required /></label>
      <label className="field">설명<textarea name="description" rows={3} placeholder="무엇을 함께 맡게 되는지" required /></label>
      <label className="field">필요 역량 <span className="optional">쉼표로 구분</span><input name="skills" placeholder="React, Figma, Python" /></label>
      <div className="composer-links"><label className="field">주 최소 시간<input name="weekly_hours_min" type="number" min="0" /></label><label className="field">주 최대 시간<input name="weekly_hours_max" type="number" min="0" /></label></div>
      {error && <div className="error notice">{error}</div>}
      <div className="row"><button type="button" className="btn secondary full" onClick={() => setOpen(false)}>취소</button><button className="btn primary full">추가</button></div>
    </form></div>}
  </>;
}
