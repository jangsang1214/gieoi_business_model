"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export function RecordDeleteButton({ id, authorId, media }: { id:string; authorId:string; media:unknown }) {
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const router=useRouter();
 async function remove() {
  if (busy || !confirm("이 기록을 삭제할까요?")) return;
  setBusy(true);
  const supabase=createClient();
  const {data,error:failure}=await supabase.from("records")
    .delete().eq("id",id).eq("author_id",authorId).select("id").maybeSingle();
  if (failure || !data) {setError(failure?.message||"삭제하지 못했습니다.");setBusy(false);return;}
  const paths:string[]=Array.isArray(media)?media.map((x:{path?:string})=>x?.path).filter((x:unknown):x is string=>typeof x==="string"):[];
  if(paths.length) {
    const {error:cleanupError}=await supabase.storage.from("record-media").remove(paths);
    if(cleanupError) console.warn("Image cleanup failed:",cleanupError.message);
  }
  router.push("/profile");router.refresh();
 }
 return <span><button type="button" className="btn secondary" disabled={busy} onClick={remove}>{busy?"삭제 중":"삭제"}</button>{error&&<span role="alert">{error}</span>}</span>;
}
