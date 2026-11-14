"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { messagesFor, type Locale } from "@/lib/i18n";

export function GettingStarted({ hasDomain, hasGoal, hasRecord, locale }: { hasDomain: boolean; hasGoal: boolean; hasRecord: boolean; locale: Locale }) {
  const t = messagesFor(locale).onboarding;
  const [hidden, setHidden] = useState(true);
  const finished = hasDomain && hasGoal && hasRecord;
  useEffect(() => { setHidden(window.localStorage.getItem("gieoi:hide-start") === "1"); }, []);
  if (finished || hidden) return null;
  const steps = [hasDomain, hasGoal, hasRecord].filter(Boolean).length;
  const nextMessage = !hasDomain
    ? (locale === "en" ? "Start with your interests so people and opportunities can find you." : "먼저 관심 분야를 선택하면 나에게 맞는 사람과 기회를 발견하기 쉬워져요.")
    : !hasGoal
      ? (locale === "en" ? "Create one Goal. Your first milestone can be small." : "첫 Goal을 만들어보세요. 작은 목표도 충분해요.")
      : (locale === "en" ? "Share your first update. A sentence is enough." : "첫 Journey를 남겨보세요. 한 문장이면 충분해요.");
  return <section className="getting-started-v9" aria-label={t.title}>
    <div className="getting-started-heading"><div><span className="mini-label">GET STARTED · {steps}/3</span><h2>{t.title}</h2></div>
      <button type="button" aria-label={t.close} onClick={() => { window.localStorage.setItem("gieoi:hide-start", "1"); setHidden(true); }}>×</button>
    </div>
    <p className="onboarding-next-prompt">{nextMessage}</p>
    <div className="getting-started-steps">
      <Link href="/settings" className={hasDomain ? "done" : ""}><span>{hasDomain ? "✓" : "1"}</span><b>{t.interests}</b><small>{t.profile}</small></Link>
      <Link href="/profile" className={hasGoal ? "done" : ""}><span>{hasGoal ? "✓" : "2"}</span><b>{t.goal}</b><small>{t.myLife}</small></Link>
      <button type="button" className={hasRecord ? "done" : ""} onClick={() => window.dispatchEvent(new CustomEvent("gieoi:compose", { detail: { type: "journey" } }))}><span>{hasRecord ? "✓" : "3"}</span><b>{t.record}</b><small>{t.records}</small></button>
    </div>
  </section>;
}
