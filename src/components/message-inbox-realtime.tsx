"use client";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
export function MessageInboxRealtime(){
 const router=useRouter();
 useEffect(()=>{
  const supabase=createClient();
  const ch=supabase.channel("prof-inbox-activity")
    .on("postgres_changes",{event:"UPDATE",schema:"public",table:"conversations"},()=>router.refresh())
    .on("postgres_changes",{event:"INSERT",schema:"public",table:"conversations"},()=>router.refresh())
    .subscribe();
  const onFocus=()=>router.refresh();
  window.addEventListener("focus",onFocus);
  return ()=>{window.removeEventListener("focus",onFocus);void supabase.removeChannel(ch)};
 },[router]);
 return null;
}
