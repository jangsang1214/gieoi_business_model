"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export function RecordDeleteButton({ id, authorId }: { id:string; authorId:string }) {
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const router=useRouter();
 async function remove() {
  if (busy || !confirm("이 기록을 삭제할까요?")) return;
  setBusy(true);
  const {data,error:failure}=await createClient().from("records")
    .delete().eq("id",id).eq("author_id",authorId).select("id").maybeSingle();
  if (failure || !data) {setError(failure?.message||"삭제하지 못했습니다.");setBusy(false);return;}
  router.push("/profile");router.refresh();
 }
 return <span><button type="button" className="btn secondary" disabled={busy} onClick={remove}>{busy?"삭제 중":"삭제"}</button>{error&&<span role="alert">{error}</span>}</span>;
}
