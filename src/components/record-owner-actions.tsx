"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RecordOwnerActions({ recordId, authorId, initialBody, initialVisibility, hasTeam }: {
 recordId: string; authorId: string; initialBody: string;
 initialVisibility: string; hasTeam: boolean;
}) {
 const [editing, setEditing] = useState(false);
 const [body, setBody] = useState(initialBody);
 const [visibility, setVisibility] = useState(initialVisibility);
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState("");
 const router = useRouter();
 async function save() {
   if(busy || !body.trim()) return;
   setBusy(true); setError("");
   const { data, error: failed } = await createClient().from("records")
     .update({body:body.trim(),visibility}).eq("id",recordId).eq("author_id",authorId).select("id").maybeSingle();
   if(failed || !data) setError(failed?.message || "저장하지 못했습니다.");
   else {setEditing(false); router.refresh();}
   setBusy(false);
 }
 return <div className="record-owner-tools">
   <button className="btn secondary" type="button" onClick={()=>setEditing(!editing)}>수정</button>
   {editing && <div className="record-owner-editor">
     <label className="field">내용<textarea rows={4} maxLength={5000} value={body} onChange={e=>setBody(e.target.value)} disabled={busy}/></label>
     <label className="field">공개 범위<select value={visibility} onChange={e=>setVisibility(e.target.value)} disabled={busy}>
       <option value="public">전체 공개</option><option value="followers">팔로워 공개</option>
       {hasTeam && <option value="team">TEAM 공개</option>}<option value="private">나만 보기</option>
     </select></label>
     <button className="btn primary" type="button" disabled={busy || !body.trim()} onClick={save}>{busy?"저장 중":"저장"}</button>
   </div>}
   {error && <div className="error notice" role="alert">{error}</div>}
 </div>;
}
