import { getLocale } from "@/lib/i18n-server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default async function ForgotPasswordPage() {
  const locale = await getLocale();
  return <main className="login-shell login-shell-v16">
    <section className="login-story login-story-v16">
      <div className="login-brand">prof.</div>
      <div className="login-copy login-copy-v16">
        <span className="eyebrow">PROF.</span>
        <h1>{locale === "en" ? "Get back to building." : "다시 이어서 쌓아가세요."}</h1>
        <p>{locale === "en" ? "Recover your account securely." : "계정을 안전하게 복구할 수 있어요."}</p>
      </div>
    </section>
    <section className="login-entry login-entry-v16">
      <div className="login-entry-inner">
        <div className="login-locale"><LocaleSwitcher locale={locale} compact/></div>
        <div className="login-entry-head login-entry-head-v16">
          <h2>{locale === "en" ? "Reset your password" : "비밀번호 재설정"}</h2>
          <p>{locale === "en" ? "We'll send a recovery link to your email." : "가입한 이메일로 복구 링크를 보내드려요."}</p>
        </div>
        <ForgotPasswordForm locale={locale}/>
      </div>
    </section>
  </main>;
}
