import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n-server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/login?error=confirm");
  const locale = await getLocale();
  return <main className="login-shell login-shell-v16">
    <section className="login-story login-story-v16">
      <div className="login-brand">prof.</div>
      <div className="login-copy login-copy-v16">
        <span className="eyebrow">PROF.</span>
        <h1>{locale === "en" ? "Protect your next chapter." : "다음 기록을 위한 안전한 계정."}</h1>
        <p>{locale === "en" ? "Choose a new password to continue." : "새 비밀번호로 계정을 안전하게 이어가세요."}</p>
      </div>
    </section>
    <section className="login-entry login-entry-v16">
      <div className="login-entry-inner">
        <div className="login-locale"><LocaleSwitcher locale={locale} compact/></div>
        <div className="login-entry-head login-entry-head-v16">
          <h2>{locale === "en" ? "Choose a new password" : "새 비밀번호 설정"}</h2>
          <p>{locale === "en" ? "Make it unique to this account." : "다른 계정과 구분되는 비밀번호를 사용하세요."}</p>
        </div>
        <ResetPasswordForm locale={locale}/>
      </div>
    </section>
  </main>;
}
