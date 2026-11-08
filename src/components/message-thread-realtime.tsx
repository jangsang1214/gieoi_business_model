"use client";
import {useEffect,useRef} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
export function MessageThreadRealtime({conversationId}:{conversationId:string}){
 const router=useRouter();
 const readBusy=useRef(false);
 useEffect(()=>{
  const supabase=createClient();
  let disposed=false;
  async function markRead(){
   if(disposed||readBusy.current||document.visibilityState!=="visible")return;
   readBusy.current=true;
   const {error}=await supabase.rpc("mark_conversation_read",{p_conversation_id:conversationId});
   if(error)console.warn("Could not mark messages read:",error.message);
   readBusy.current=false;
  }
  void markRead();
  const ch=supabase.channel("prof-thread-"+conversationId)
    .on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",
        filter:"conversation_id=eq."+conversationId},()=>{
      router.refresh();
      void markRead();
    })
    .subscribe();
  const onVisible=()=>{if(document.visibilityState==="visible"){router.refresh();void markRead()}};
  document.addEventListener("visibilitychange",onVisible);
  return ()=>{disposed=true;document.removeEventListener("visibilitychange",onVisible);void supabase.removeChannel(ch)};
 },[router,conversationId]);
 return null;
}
