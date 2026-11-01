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
          <div className="eyebrow">A LIFE, PROVEN BY LIVING</div>
          <h1>너는 어떻게<br />살아갈 것인가?</h1>
          <p>살아온 과정은 기록이 되고, 기록은 Proof가 되고,<br />결국 사람과 기회로 이어집니다.</p>
        </div>

        <div className="login-preview" aria-hidden="true">
          <div className="preview-screen">
            <div className="preview-top">기어이.</div>
            <div className="preview-tabs"><span>FOR YOU</span><span>BUSINESS</span><span>CREATE</span></div>
            <div className="preview-post">
              <div className="preview-user">
                <div className="preview-avatar" />
                <div><b>민재</b><small>오늘 · BUSINESS</small></div>
              </div>
              <div className="preview-copy">첫 고객 인터뷰 10명을 끝냈다. 생각보다 문제는 기능보다 반복 사용 이유에 가까웠다.</div>
              <div className="preview-tags"><span>JOURNEY</span><span>Goal · 첫 제품 출시</span></div>
            </div>
            <div className="preview-proof">
              <div className="preview-proof-label">DIRECTION MATCH</div>
              <div className="preview-proof-row"><b>BUILD TOGETHER</b><span className="preview-score">94%</span></div>
            </div>
          </div>
        </div>

        <div className="login-signature">기어이, 우리가 꿈꾸던 곳까지.</div>
      </section>

      <section className="login-entry">
        <div className="login-entry-inner">
          <div className="login-mobile-brand">기어이.</div>
          <div className="login-entry-head">
            <span className="eyebrow">WELCOME TO GIEOI</span>
            <h2>살아온 것이<br />당신을 보여주도록.</h2>
            <p>목표를 말하는 곳이 아니라, 실제로 살아가는 과정을 남기는 네트워크.</p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
