import { LoginForm } from "@/components/login-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { getLocale } from "@/lib/i18n-server";
import { messagesFor } from "@/lib/i18n";

export default async function LoginPage() {
  const locale = await getLocale();
  const t = messagesFor(locale).auth;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims?.sub) redirect("/");

  return (
    <main className="login-shell login-shell-v16">
      <section className="login-story login-story-v16" aria-label="prof. Introduction">
        <div className="login-brand">prof.</div>
        <div className="login-copy login-copy-v16">
          <span className="eyebrow">PROF.</span>
          <h1>{t.hero.split("\n").map((line, index) => <span key={line}>{index > 0 && <br/>}{line}</span>)}</h1>
          <p>{t.heroDesc}</p>
        </div>
        <div className="login-story-foot-v16">
          <span>{t.story[0]}</span><span aria-hidden="true">·</span><span>{t.story[1]}</span>
          <span aria-hidden="true">·</span><span>{t.story[2]}</span>
        </div>
      </section>

      <section className="login-entry login-entry-v16">
        <div className="login-entry-inner">
          <div className="login-locale"><LocaleSwitcher locale={locale} compact /></div>
          <div className="login-mobile-brand">prof.</div>
          <div className="login-entry-head login-entry-head-v16">
            <h2>{t.welcome}</h2>
            <p>{t.subtitle}</p>
          </div>
          <LoginForm locale={locale} />
        </div>
      </section>
    </main>
  );
}
