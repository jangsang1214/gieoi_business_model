"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ReportTarget = "user" | "team" | "record" | "proof" | "message";
export function ReportButton({ userId, targetType, targetId }: {
 userId:string; targetType:ReportTarget; targetId:string;
}) {
 const [open,setOpen]=useState(false);
 const [busy,setBusy]=useState(false);
 const [reason,setReason]=useState("spam");
 const [details,setDetails]=useState("");
 const [error,setError]=useState("");
 const [success,setSuccess]=useState(false);
 async function send() {
   if(busy)return;
   setBusy(true);setError("");
   const {error:failed}=await createClient().from("reports").insert({
     reporter_id:userId,target_type:targetType,target_id:targetId,reason,details:details.trim().slice(0,1000)
   });
   if(failed)setError("신고 접수에 실패했습니다. 다시 시도해 주세요.");
   else {setSuccess(true);setOpen(false);}
   setBusy(false);
 }
 return <div className="safety-action">
   {success?<span className="meta">신고가 접수됐습니다.</span>:
     <button type="button" className="quiet-link" onClick={()=>setOpen(v=>!v)}>{open?"신고 취소":"신고"}</button>}
   {open && <div className="safety-report-panel">
     <label className="field">신고 사유<select value={reason} onChange={e=>setReason(e.target.value)} disabled={busy}>
       <option value="spam">스팸·광고</option><option value="harassment">괴롭힘</option><option value="impersonation">사칭</option>
       <option value="privacy">개인정보 침해</option><option value="other">기타</option>
     </select></label>
     <label className="field">상세 내용 (선택)<textarea rows={3} maxLength={1000} value={details} disabled={busy} onChange={e=>setDetails(e.target.value)}/></label>
     <button type="button" className="btn primary" onClick={send} disabled={busy}>{busy?"접수 중":"신고 제출"}</button>
     {error && <div className="error notice" role="alert">{error}</div>}
   </div>}
 </div>;
}
