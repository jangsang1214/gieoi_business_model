"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";

export function ResetPasswordForm({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password.length < 8 || password.length > 72) {
      setError(en ? "Use a password between 8 and 72 characters." : "비밀번호는 8~72자로 입력해 주세요.");
      return;
    }
    if (password !== confirm) {
      setError(en ? "Passwords do not match." : "비밀번호가 서로 다릅니다.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: changeError } = await supabase.auth.updateUser({ password });
      if (changeError) {
        setError(en ? "Could not change your password. Try the recovery link again." : "비밀번호를 변경하지 못했습니다. 복구 링크를 다시 확인해 주세요.");
        return;
      }
      // Revoke the recovery session; ask the user to log in with the new password.
      await supabase.auth.signOut();
      setDone(true);
    } catch {
      setError(en ? "Connection problem. Try again." : "연결에 문제가 생겼습니다. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  if (done) return <div className="auth-panel">
    <p role="status" className="success auth-message">
      {en ? "Your password has been changed. Sign in to continue." : "비밀번호를 변경했습니다. 다시 로그인해 주세요."}
    </p>
    <Link className="auth-submit" href="/login">{en ? "Log in" : "로그인"}</Link>
  </div>;

  return <div className="auth-panel"><form className="auth-form" onSubmit={submit}>
    <label className="auth-field">
      <span>{en ? "New password" : "새 비밀번호"}</span>
      <input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required disabled={busy}/>
    </label>
    <label className="auth-field">
      <span>{en ? "Confirm new password" : "새 비밀번호 확인"}</span>
      <input name="confirm" type="password" autoComplete="new-password" minLength={8} maxLength={72} required disabled={busy}/>
    </label>
    {error && <p role="alert" className="error auth-message">{error}</p>}
    <button className="auth-submit" disabled={busy} type="submit">
      {busy ? (en ? "Updating..." : "변경 중...") : (en ? "Update password" : "비밀번호 변경")}
    </button>
  </form></div>;
}
