"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { messagesFor, type Locale } from "@/lib/i18n";

function friendly(message: string, locale: Locale) {
  const t = messagesFor(locale).auth;
  const text = message.toLowerCase();
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
      const email = String(fd.get("email") || "").trim();
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
          setOk(true);
          setMsg(t.confirmation);
        }
      }
    } catch {
      setMsg(locale === "en" ? "Connection problem. Try again." : "연결에 문제가 생겼습니다. 다시 시도해 주세요.");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  function changeMode(next: "login" | "signup") {
    setMode(next);
    setMsg("");
    setOk(false);
  }

  return (
    <div className="auth-panel">
      <form onSubmit={submit} className="auth-form">
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
        {msg && <div role={ok ? "status" : "alert"} className={ok ? "success auth-message" : "error auth-message"}>{msg}</div>}

        <button className="auth-submit" disabled={loading}>
          {loading ? t.loading : mode === "login" ? t.login : t.signup}
        </button>
      </form>

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
