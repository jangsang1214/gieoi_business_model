"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function BlockUserButton({ userId, targetId }: { userId:string; targetId:string }) {
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const router=useRouter();
 async function block() {
   if(busy || !window.confirm("이 사용자를 차단할까요? 서로의 프로필, 공개 기록, 대화 접근이 제한됩니다.")) return;
   setBusy(true);setError("");
   const {error:failed}=await createClient().from("blocks").insert({blocker_id:userId,blocked_id:targetId});
   if(failed) setError(failed.message);
   else {router.push("/explore");router.refresh();}
   setBusy(false);
 }
 return <span className="safety-action"><button type="button" disabled={busy} className="quiet-link" onClick={block}>차단</button>{error&&<span role="alert" className="error notice">{error}</span>}</span>;
}

export function UnblockUserButton({ userId, targetId }: { userId:string; targetId:string }) {
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const router=useRouter();
 async function unblock() {
   if(busy)return;
   setBusy(true);setError("");
   const {data,error:failed}=await createClient().from("blocks")
     .delete().eq("blocker_id",userId).eq("blocked_id",targetId).select("blocked_id").maybeSingle();
   if(failed || !data)setError(failed?.message||"차단 해제 실패");
   else router.refresh();
   setBusy(false);
 }
 return <span className="safety-action"><button type="button" disabled={busy} className="btn secondary" onClick={unblock}>{busy?"처리 중":"차단 해제"}</button>{error&&<span role="alert" className="error notice">{error}</span>}</span>;
}
