"use client";

import { FormEvent, useState } from "react";
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

export function LoginForm({ locale }: { locale: Locale }) {
  const t = messagesFor(locale).auth;
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const router = useRouter();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setOk(false);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    const name = String(fd.get("name") || "").trim();
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

    setLoading(false);
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
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              placeholder={t.password}
            />
            <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? t.hide : t.show}>
              {showPassword ? t.hide : t.show}
            </button>
          </div>
        </label>

        {msg && <div className={ok ? "success auth-message" : "error auth-message"}>{msg}</div>}

        <button className="auth-submit" disabled={loading}>
          {loading ? t.loading : mode === "login" ? t.login : t.signup}
        </button>
      </form>

      <div className="auth-switch">
        <span>{mode === "login" ? t.questionLogin : t.questionSignup}</span>
        <button type="button" onClick={() => changeMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? t.join : t.login}
        </button>
      </div>

      <p className="auth-footnote">{t.footnote}</p>
    </div>
  );
}
