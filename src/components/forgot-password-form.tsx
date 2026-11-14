"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";

export function ForgotPasswordForm({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!email) return;

    setBusy(true);
    setError("");
    try {
      // Supabase does not reveal whether an email address belongs to an account.
      // The callback exchanges the PKCE code before displaying /reset-password.
      const { error: resetError } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=%2Freset-password`,
      });
      if (resetError) {
        setError(en ? "Could not send the reset email. Try again later." : "재설정 메일을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.");
      } else {
        setSent(true);
      }
    } catch {
      setError(en ? "Connection problem. Try again." : "연결에 문제가 생겼습니다. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="auth-panel">
    {sent
      ? <p role="status" className="success auth-message">
          {en
            ? "If an account exists for this email, a password reset link has been sent. Check your inbox and spam folder."
            : "해당 이메일에 가입된 계정이 있다면 비밀번호 재설정 링크가 발송됩니다. 받은편지함과 스팸함을 확인해 주세요."}
        </p>
      : <form className="auth-form" onSubmit={submit}>
          <label className="auth-field">
            <span>{en ? "Account email" : "가입한 이메일"}</span>
            <input type="email" name="email" autoComplete="email"
              placeholder={en ? "you@example.com" : "이메일 주소"} required disabled={busy}/>
          </label>
          {error && <p className="error auth-message" role="alert">{error}</p>}
          <button type="submit" className="auth-submit" disabled={busy}>
            {busy ? (en ? "Sending..." : "보내는 중...") : (en ? "Send reset link" : "재설정 링크 보내기")}
          </button>
        </form>}
    <div className="auth-switch"><Link href="/login">{en ? "Back to log in" : "로그인으로 돌아가기"}</Link></div>
  </div>;
}
