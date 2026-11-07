import { LoginForm } from "@/components/login-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims?.sub) redirect("/");

  return (
    <main className="login-shell login-shell-v16">
      <section className="login-story login-story-v16" aria-label="prof. 소개">
        <div className="login-brand">prof.</div>
        <div className="login-copy login-copy-v16">
          <span className="eyebrow">PROF.</span>
          <h1>지금 하는 일을 남기고,<br/>함께할 사람을 만나요.</h1>
          <p>기록이 쌓이고, 새로운 연결이 시작되는 곳.</p>
        </div>
        <div className="login-story-foot-v16">
          <span>기록</span><span aria-hidden="true">·</span><span>발견</span>
          <span aria-hidden="true">·</span><span>연결</span>
        </div>
      </section>

      <section className="login-entry login-entry-v16">
        <div className="login-entry-inner">
          <div className="login-mobile-brand">prof.</div>
          <div className="login-entry-head login-entry-head-v16">
            <h2>프로프에 오신 걸 환영해요.</h2>
            <p>계정에 로그인하고 이어서 기록해 보세요.</p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
