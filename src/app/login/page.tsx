import { LoginForm } from "@/components/login-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export default async function LoginPage(){const supabase=await createClient();const {data}=await supabase.auth.getClaims();if(data?.claims?.sub)redirect('/');return <main className="login-wrap"><div className="login-card"><div className="brand">기어이.</div><div className="manifesto">너는 어떻게<br/>살아갈 것인가?</div><small>기술은 대신할 수 있어도, 삶은 대신 살아줄 수 없습니다.</small><LoginForm/></div></main>}
