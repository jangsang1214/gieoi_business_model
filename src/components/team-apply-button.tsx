"use client";
import { useState } from "react";import { createClient } from "@/lib/supabase/client";import { useRouter } from "next/navigation";
export function TeamApplyButton({teamId,userId}:{teamId:string;userId:string}){const [busy,setBusy]=useState(false);const router=useRouter();return <button className="btn secondary" disabled={busy} onClick={async()=>{setBusy(true);const supabase=createClient();await supabase.from('team_applications').insert({team_id:teamId,applicant_id:userId,why:'기어이에서 TEAM의 방향과 제 궤적이 맞아 함께하고 싶습니다.'});setBusy(false);router.refresh()}}>{busy?'전송 중':'함께하기'}</button>}
