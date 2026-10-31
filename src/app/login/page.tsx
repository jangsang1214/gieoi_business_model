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
          <div className="eyebrow light">A LIFE, PROVEN BY LIVING</div>
          <h1>너는 어떻게<br />살아갈 것인가?</h1>
          <p>기술은 대신할 수 있어도,<br />삶은 대신 살아줄 수 없습니다.</p>
        </div>
        <div className="login-trajectory" aria-hidden="true">
          <span>GOAL</span><i />
          <span>JOURNEY</span><i />
          <span>PROOF</span><i />
          <span>TEAM</span><i />
          <span>OPPORTUNITY</span>
        </div>
        <div className="login-signature">우리가 꿈꾸던 곳까지.</div>
      </section>

      <section className="login-entry">
        <div className="login-entry-inner">
          <div className="login-mobile-brand">기어이.</div>
          <div className="login-entry-head">
            <span className="eyebrow">WELCOME TO GIEOI</span>
            <h2>살아온 것이<br />당신을 보여주도록.</h2>
            <p>기록은 쌓이고, 과정은 Proof가 되며, 결국 사람과 기회로 이어집니다.</p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
