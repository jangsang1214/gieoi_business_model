import { LoginForm } from "@/components/login-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims?.sub) redirect("/");

  return (
    <main className="login-shell">
      <section className="login-story">
        <div className="login-brand">기어이.</div>

        <div className="login-copy">
          <span className="eyebrow">GIEOI / PROOF OF TRAJECTORY</span>
          <h1>너는 어떻게<br />살아갈 것인가?</h1>
          <p>기술은 대신할 수 있어도,<br />삶은 대신 살아줄 수 없습니다.</p>
        </div>

        <div className="login-index" aria-label="기어이의 기록 구조">
          <div><span>01</span><b>GOAL</b><em>어디로 향하는가</em></div>
          <div><span>02</span><b>JOURNEY</b><em>어떻게 살아가는가</em></div>
          <div><span>03</span><b>PROOF</b><em>무엇을 남겼는가</em></div>
          <div><span>04</span><b>TEAM</b><em>누구와 함께하는가</em></div>
        </div>

        <div className="login-signature">기어이, 우리가 꿈꾸던 곳까지.</div>
      </section>

      <section className="login-entry">
        <div className="login-entry-inner">
          <div className="login-mobile-brand">기어이.</div>
          <div className="login-entry-head">
            <span className="eyebrow">WELCOME</span>
            <h2>살아온 것이<br />당신을 보여주도록.</h2>
            <p>목표보다 과정이, 말보다 기록이 남는 네트워크.</p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
