"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function friendly(message: string) {
  const text = message.toLowerCase();
  if (text.includes("invalid login credentials")) return "이메일 또는 비밀번호를 다시 확인해주세요.";
  if (text.includes("already registered")) return "이미 가입된 이메일입니다. 로그인으로 들어가주세요.";
  if (text.includes("password")) return "비밀번호는 6자 이상으로 입력해주세요.";
  if (text.includes("email")) return "사용할 수 있는 이메일 주소인지 확인해주세요.";
  return "잠시 문제가 생겼습니다. 다시 시도해주세요.";
}

function MailIcon() {
  return <span className="input-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 6.5h16v11H4z"/><path d="m5 8 7 5 7-5"/></svg></span>;
}

export function LoginForm() {
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
      if (error) setMsg(friendly(error.message));
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
      if (error) setMsg(friendly(error.message));
      else if (data.session) {
        router.replace("/");
        router.refresh();
      } else {
        setOk(true);
        setMsg("확인 메일을 보냈습니다. 메일의 링크를 누르면 기어이가 시작됩니다.");
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
      <div className="auth-tabs" role="tablist" aria-label="로그인 방식">
        <button type="button" className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>로그인</button>
        <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => changeMode("signup")}>가입하기</button>
      </div>

      <form onSubmit={submit} className="auth-form">
        {mode === "signup" && (
          <label className="field auth-field">
            <span>이름</span>
            <div className="auth-input-wrap">
              <input name="name" required autoComplete="name" placeholder="이름" />
            </div>
          </label>
        )}

        <label className="field auth-field">
          <span>이메일</span>
          <div className="auth-input-wrap">
            <input name="email" type="email" inputMode="email" autoComplete="email" required placeholder="이메일" />
            <MailIcon />
          </div>
        </label>

        <label className="field auth-field">
          <span>비밀번호</span>
          <div className="auth-input-wrap">
            <input name="password" type={showPassword ? "text" : "password"} minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} required placeholder="비밀번호" />
            <button className="password-toggle" type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}>{showPassword ? "숨기기" : "보기"}</button>
          </div>
        </label>

        {msg && <div className={ok ? "success auth-message" : "error auth-message"}>{msg}</div>}

        <button className="btn primary full auth-submit" disabled={loading}>
          {loading ? "확인 중..." : mode === "login" ? "로그인" : "계정 만들기"}
        </button>
      </form>

      <div className="auth-divider">GIEOI</div>
      <div className="auth-switch">
        {mode === "login" ? "처음이신가요?" : "이미 계정이 있나요?"}
        <button type="button" onClick={() => changeMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "가입하기" : "로그인"}</button>
      </div>

      <div className="auth-footnote">계속하면 기어이의 이용약관 및 개인정보 처리방침에 동의하게 됩니다.</div>
    </div>
  );
}
