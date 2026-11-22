"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { messagesFor, type Locale } from "@/lib/i18n";

type GettingStartedProps = {
  hasDomain: boolean;
  hasGoal: boolean;
  hasRecord: boolean;
  hasFollowing: boolean;
  locale: Locale;
};

export function GettingStarted({ hasDomain, hasGoal, hasRecord, hasFollowing, locale }: GettingStartedProps) {
  const t = messagesFor(locale).onboarding;
  const en = locale === "en";
  const [hidden, setHidden] = useState(true);
  const finished = hasDomain && hasGoal && hasRecord && hasFollowing;

  useEffect(() => {
    try { setHidden(window.localStorage.getItem("gieoi:hide-start") === "1"); }
    catch { setHidden(false); }
  }, []);

  if (finished || hidden) return null;

  const steps = [hasDomain, hasGoal, hasRecord, hasFollowing].filter(Boolean).length;
  const nextMessage = !hasDomain
    ? (en ? "Select your interests to help filter people and opportunities." : "먼저 관심 분야를 선택해 사람과 기회를 찾아볼 준비를 하세요.")
    : !hasGoal
      ? (en ? "Set one Goal: a project, a workout or a study target." : "이루고 싶은 Goal을 하나 만들어 보세요. 운동·공부·프로젝트 모두 좋아요.")
      : !hasRecord
        ? (en ? "Post one Journey update about what you actually worked on." : "지금 진행 중인 일을 Journey로 한 번 기록해 보세요.")
        : (en ? "Explore real profiles and follow someone whose work interests you." : "다른 사람의 활동을 살펴보고 관심 있는 사람을 한 명 팔로우해 보세요.");

  const nextAction = !hasDomain
    ? <Link href="/settings" className="inline-action">{en ? "Choose interests" : "관심 분야 설정"} →</Link>
    : !hasGoal
      ? <Link href="/profile" className="inline-action">{en ? "Create your first Goal" : "첫 Goal 만들기"} →</Link>
      : !hasRecord
        ? <button type="button" className="inline-action" onClick={() =>
            window.dispatchEvent(new CustomEvent("gieoi:compose", { detail: { type: "journey" } }))
          }>{en ? "Write a Journey update" : "Journey 작성하기"} →</button>
        : <Link href="/explore?kind=person" className="inline-action">{en ? "Discover people" : "사람 찾아보기"} →</Link>;

  return <section className="getting-started-v9" aria-label={t.title}>
    <div className="getting-started-heading">
      <div>
        <span className="mini-label">GET STARTED · {steps}/4</span>
        <h2>{en ? "Make your first connection" : "첫 연결 시작하기"}</h2>
      </div>
      <button type="button" aria-label={t.close} onClick={() => {
        try { window.localStorage.setItem("gieoi:hide-start", "1"); }
        catch { /* Storage may be disabled. */ }
        setHidden(true);
      }}>×</button>
    </div>
    <p className="onboarding-next-prompt">{nextMessage}</p>
    <div className="getting-started-next">{nextAction}</div>
    <div className="getting-started-steps" aria-label={en ? "Your setup progress" : "시작 준비 진행 상황"}>
      <Link href="/settings" className={hasDomain ? "done" : ""}>
        <span>{hasDomain ? "✓" : "1"}</span><b>{t.interests}</b><small>{t.profile}</small>
      </Link>
      <Link href="/profile" className={hasGoal ? "done" : ""}>
        <span>{hasGoal ? "✓" : "2"}</span><b>{t.goal}</b><small>{t.myLife}</small>
      </Link>
      <button type="button" className={hasRecord ? "done" : ""} onClick={() =>
        window.dispatchEvent(new CustomEvent("gieoi:compose", { detail: { type: "journey" } }))
      }>
        <span>{hasRecord ? "✓" : "3"}</span><b>{t.record}</b><small>{t.records}</small>
      </button>
    </div>
    <p className="getting-started-discover">
      <Link href="/explore?kind=person">
        {hasFollowing ? "✓" : "4"} · {en ? "Find and follow people" : "사람 탐색하고 팔로우하기"} →
      </Link>
    </p>
  </section>;
}
