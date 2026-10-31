"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
export function SignOutButton(){const router=useRouter();return <button className="icon-btn" title="로그아웃" onClick={async()=>{await createClient().auth.signOut();router.replace('/login');router.refresh()}}>⋯</button>}
