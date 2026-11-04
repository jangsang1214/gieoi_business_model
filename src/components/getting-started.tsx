"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function GettingStarted({ hasDomain, hasGoal, hasRecord }: { hasDomain: boolean; hasGoal: boolean; hasRecord: boolean }) {
  const [hidden, setHidden] = useState(true);
  const finished = hasDomain && hasGoal && hasRecord;
  useEffect(() => { setHidden(window.localStorage.getItem("gieoi:hide-start") === "1"); }, []);
  if (finished || hidden) return null;
  const steps = [hasDomain, hasGoal, hasRecord].filter(Boolean).length;
  return <section className="getting-started-v9" aria-label="기어이 시작하기">
    <div className="getting-started-heading"><div><span className="mini-label">GET STARTED · {steps}/3</span><h2>시작하기</h2></div>
      <button type="button" aria-label="시작하기 안내 닫기" onClick={() => { window.localStorage.setItem("gieoi:hide-start", "1"); setHidden(true); }}>×</button>
    </div>
    <div className="getting-started-steps">
      <Link href="/settings" className={hasDomain ? "done" : ""}><span>{hasDomain ? "✓" : "1"}</span><b>관심 분야 설정</b><small>프로필</small></Link>
      <Link href="/profile" className={hasGoal ? "done" : ""}><span>{hasGoal ? "✓" : "2"}</span><b>첫 Goal 만들기</b><small>내 삶</small></Link>
      <button type="button" className={hasRecord ? "done" : ""} onClick={() => window.dispatchEvent(new CustomEvent("gieoi:compose", { detail: { type: "journey" } }))}><span>{hasRecord ? "✓" : "3"}</span><b>첫 기록 남기기</b><small>기록</small></button>
    </div>
  </section>;
}
