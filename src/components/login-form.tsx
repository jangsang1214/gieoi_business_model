"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { messagesFor, type Locale } from "@/lib/i18n";

function friendly(message: string, locale: Locale) {
  const t = messagesFor(locale).auth;
  const text = message.toLowerCase();
  if (text.includes("email rate limit") || text.includes("rate limit") || text.includes("too many requests")) {
    return locale === "en"
      ? "Too many email requests. Please wait before trying again."
      : "인증 메일 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (text.includes("error sending confirmation email") || text.includes("email address not authorized") || text.includes("email_address_not_authorized")) {
    return locale === "en"
      ? "The email service is unavailable. Check back later or contact the service administrator."
      : "인증 메일 발송 서비스를 사용할 수 없습니다. 관리자에게 발송 설정 확인을 요청해 주세요.";
  }
  if (text.includes("invalid login credentials")) return t.invalid;
  if (text.includes("already registered")) return t.registered;
  if (text.includes("password")) return t.passwordError;
  if (text.includes("email")) return t.emailError;
  return t.generic;
}

export function LoginForm({ locale, authError = false }: { locale: Locale; authError?: boolean }) {
  const t = messagesFor(locale).auth;
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const lastResendAt = useRef(0);
  const router = useRouter();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true);
    setMsg("");
    setOk(false);

    try {
      const fd = new FormData(e.currentTarget);
      const email = String(fd.get("email") || "").trim().toLowerCase();
      const password = String(fd.get("password") || "");
      const name = String(fd.get("name") || "").trim();
      if (mode === "signup" && (password.length < 8 || password.length > 72)) {
        setMsg(locale === "en"
          ? "Choose a password between 8 and 72 characters."
          : "계정을 만들려면 8~72자 비밀번호를 입력해 주세요.");
        return;
      }
      const supabase = createClient();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMsg(friendly(error.message, locale));
        else {
          router.replace("/");
          router.refresh();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name } },
        });
        if (error) setMsg(friendly(error.message, locale));
        else if (data.session) {
          router.replace("/");
          router.refresh();
        } else {
          setPendingEmail(email);
          setVerificationCode("");
          setOk(true);
          setMsg(locale === "en"
            ? "Sign-up was accepted. Check your inbox and spam folder for a confirmation link or a 6-digit code. If nothing arrives, check the email service settings."
            : "회원가입 요청이 접수됐어요. 받은편지함과 스팸함에서 인증 링크 또는 6자리 코드를 확인해 주세요. 메일이 없다면 발송 설정을 점검해야 합니다.");
        }
      }
    } catch {
      setMsg(locale === "en" ? "Connection problem. Try again." : "연결에 문제가 생겼습니다. 다시 시도해 주세요.");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  async function verifyEmailCode() {
    if (verifying || !pendingEmail || !/^\\d{6}$/.test(verificationCode)) return;
    setVerifying(true);
    setMsg("");
    setOk(false);
    try {
      const { data, error } = await createClient().auth.verifyOtp({
        email: pendingEmail,
        token: verificationCode,
        type: "email",
      });
      if (error) {
        setMsg(locale === "en"
          ? "Invalid or expired code. Check the latest email or request a new one."
          : "인증번호가 올바르지 않거나 만료됐어요. 최신 메일을 확인하거나 재발송해 주세요.");
      } else if (data.session) {
        setPendingEmail("");
        router.replace("/");
        router.refresh();
      } else {
        setOk(true);
        setMsg(locale === "en" ? "Email verified. Sign in to continue." : "이메일 인증이 완료됐어요. 로그인해 주세요.");
        setPendingEmail("");
        setMode("login");
      }
    } catch {
      setMsg(locale === "en" ? "Connection problem. Try again." : "연결에 문제가 생겼어요. 다시 시도해 주세요.");
    } finally {
      setVerifying(false);
    }
  }

  async function resendConfirmation() {
    if (!pendingEmail || resending) return;
    const now = Date.now();
    if (now - lastResendAt.current < 60_000) {
      setOk(false);
      setMsg(locale === "en" ? "Please wait 60 seconds between email requests." : "인증 메일은 60초 간격으로 다시 요청할 수 있어요.");
      return;
    }
    setResending(true);
    setMsg("");
    try {
      const { error } = await createClient().auth.resend({ type: "signup", email: pendingEmail });
      if (error) {
        setOk(false);
        setMsg(friendly(error.message, locale));
      } else {
        lastResendAt.current = Date.now();
        setOk(true);
        setMsg(locale === "en"
          ? "Confirmation requested again. Check your inbox and spam folder."
          : "인증 메일 재발송을 요청했어요. 받은편지함과 스팸함을 확인해 주세요.");
      }
    } catch {
      setOk(false);
      setMsg(locale === "en" ? "Connection problem. Try again." : "연결에 문제가 생겼어요. 다시 시도해 주세요.");
    } finally {
      setResending(false);
    }
  }

  function changeMode(next: "login" | "signup") {
    setMode(next);
    setMsg("");
    setOk(false);
    setPendingEmail("");
    setVerificationCode("");
  }

  return (
    <div className="auth-panel">
      {pendingEmail && <section className="auth-verification" aria-label={locale === "en" ? "Confirm your email" : "이메일 인증"}>
        <h3>{locale === "en" ? "Verify your email" : "이메일 인증"}</h3>
        <p className="auth-verification-hint">{locale === "en"
          ? `Check the message sent to ${pendingEmail}. If your email contains a confirmation link, open it; if it contains a 6-digit code, enter it here.`
          : `${pendingEmail} 주소로 전송된 메일을 확인해 주세요. 인증 링크가 있다면 누르고, 6자리 코드가 있다면 아래에 입력하세요.`}</p>
        <label className="auth-field"><span>{locale === "en" ? "6-digit email code" : "이메일 인증번호 6자리"}</span>
          <input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6}
            value={verificationCode} onChange={event => setVerificationCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            placeholder="000000" disabled={verifying}/>
        </label>
        <div className="auth-verification-actions">
          <button type="button" className="auth-submit" disabled={verifying || verificationCode.length !== 6} onClick={verifyEmailCode}>
            {verifying ? (locale === "en" ? "Checking..." : "인증 중...") : (locale === "en" ? "Verify code" : "인증번호 확인")}
          </button>
          <button type="button" className="btn secondary" disabled={resending} onClick={resendConfirmation}>
            {resending ? (locale === "en" ? "Requesting..." : "요청 중...") : (locale === "en" ? "Resend email" : "인증 메일 재발송")}
          </button>
        </div>
        <p className="auth-verification-hint">{locale === "en"
          ? "If no email arrives, delivery may be restricted by the email provider or project settings. Contact the service administrator."
          : "메일이 계속 오지 않는다면 서버의 이메일 발송 제한 또는 SMTP 설정 문제일 수 있습니다."}</p>
      </section>}
      {!pendingEmail && <form onSubmit={submit} className="auth-form">
        {mode === "signup" && (
          <label className="auth-field">
            <span>{t.name}</span>
            <input name="name" required autoComplete="name" placeholder={t.name} />
          </label>
        )}

        <label className="auth-field">
          <span>{t.email}</span>
          <input name="email" type="email" inputMode="email" autoComplete="email" required placeholder={t.email} />
        </label>

        <label className="auth-field">
          <span>{t.password}</span>
          <div className="auth-password">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              minLength={mode === "signup" ? 8 : 1}
              maxLength={mode === "signup" ? 72 : undefined}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              placeholder={t.password}
            />
            <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? t.hide : t.show}>
              {showPassword ? t.hide : t.show}
            </button>
          </div>
        </label>

        {authError && !msg && <p className="error auth-message" role="alert">{locale === "en" ? "This link expired or could not be verified. Request a new one." : "링크가 만료됐거나 인증하지 못했습니다. 새 링크를 요청해 주세요."}</p>}

        <button className="auth-submit" disabled={loading}>
          {loading ? t.loading : mode === "login" ? t.login : t.signup}
        </button>
      </form>}
      {msg && <div role={ok ? "status" : "alert"} className={ok ? "success auth-message" : "error auth-message"}>{msg}</div>}

      {mode === "login" && <div className="auth-switch"><Link href="/forgot-password">{locale === "en" ? "Forgot password?" : "비밀번호를 잊으셨나요?"}</Link></div>}
      <div className="auth-switch">
        <span>{mode === "login" ? t.questionLogin : t.questionSignup}</span>
        <button type="button" onClick={() => changeMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? t.join : t.login}
        </button>
      </div>

      <div className="auth-switch"><Link href="/about">{locale === "en" ? "What is Prof.?" : "Prof.는 어떤 서비스인가요?"}</Link></div>
      <p className="auth-footnote">{t.footnote}</p>
    </div>
  );
}
