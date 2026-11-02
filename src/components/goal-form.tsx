"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function GoalForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function submit(fd: FormData) {
    const supabase = createClient();
    await supabase.from("goals").insert({
      owner_id: userId,
      domain: String(fd.get("domain")),
      title: String(fd.get("title") || "").trim(),
      why: String(fd.get("why") || "").trim() || null,
      visibility: "public",
      status: "active",
    });
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button className="btn primary" onClick={() => setOpen(true)}>Goal 추가</button>
      {open && (
        <div className="overlay">
          <form className="sheet goal-v4" action={submit}>
            <div className="grab" />
            <h2>새 Goal</h2>
            <label className="field">무엇을 이루고 싶나요?<input name="title" placeholder="예: 첫 제품 출시, 대회 본선 진출" required /></label>
            <label className="field">분야<select name="domain"><option value="business">BUSINESS</option><option value="workout">WORKOUT</option><option value="create">CREATE</option><option value="study">STUDY</option><option value="career">CAREER</option><option value="lifestyle">LIFESTYLE</option></select></label>
            <label className="field">메모 <span className="optional">선택</span><textarea name="why" rows={3} placeholder="왜 이걸 하고 싶은지 짧게 남겨도 됩니다." /></label>
            <div className="row"><button type="button" className="btn secondary full" onClick={() => setOpen(false)}>취소</button><button className="btn primary full">추가</button></div>
          </form>
        </div>
      )}
    </>
  );
}
