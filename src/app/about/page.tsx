import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { LocaleSwitcher } from "@/components/locale-switcher";

export const metadata: Metadata = {
  title: "prof. — Build your story. Find your people.",
  description: "Record your goals, show your progress, and connect your Proof to people, teams and opportunities. 목표와 과정, 성과로 연결되는 네트워크 prof.",
  openGraph: {
    title: "prof. — Build your story. Find your people.",
    description: "Your progress deserves to open doors. Goal · Journey · Proof · TEAM · Opportunity.",
    type: "website",
  },
};

export default async function AboutPage() {
  const locale = await getLocale();
  const en = locale === "en";
  const stages = en
    ? [
        { key: "01 / GOAL", title: "Choose your direction", body: "Show what you want to accomplish and why it matters." },
        { key: "02 / JOURNEY", title: "Document the work", body: "Build a visible record of the steps you take." },
        { key: "03 / PROOF", title: "Show what you've done", body: "Connect milestones to supporting evidence and context." },
      ]
    : [
        { key: "01 / GOAL", title: "목표를 세우고", body: "무엇을 이루고 싶은지, 왜 중요한지 남깁니다." },
        { key: "02 / JOURNEY", title: "과정을 기록하고", body: "지금 하고 있는 일을 작은 기록으로 쌓아갑니다." },
        { key: "03 / PROOF", title: "결과를 증명합니다", body: "성과와 관련된 근거를 연결해 보여줍니다." },
      ];

  return <main className="public-page">
    <header className="public-top">
      <Link className="public-brand" href="/about">prof<span>.</span></Link>
      <div className="public-header-actions">
        <LocaleSwitcher locale={locale} compact/>
        <Link href="/login" className="public-sign-in">{en ? "Log in" : "로그인"}</Link>
      </div>
    </header>

    <section className="public-hero">
      <p className="public-kicker">PROOF OF TRAJECTORY · EARLY BETA</p>
      <h1>{en ? <>Build your story.<br/>Find your people.</> : <>쌓아온 것이,<br/>기회가 되도록.</>}</h1>
      <p className="public-intro">{en
        ? "Not just what you say you can do. Show what you've worked on, where you're going, and who you could build with."
        : "말보다 실제로 해온 일이 당신을 보여주도록. 목표와 과정, 성과를 쌓고 함께할 사람과 다음 기회를 발견하는 공간."}</p>
      <div className="public-hero-actions">
        <Link href="/login" className="public-primary">{en ? "Explore the beta" : "베타 시작하기"}</Link>
        <a href="#how-it-works" className="public-secondary">{en ? "How prof. works" : "prof. 알아보기"}</a>
      </div>
      <p className="public-helper">{en
        ? "A new network in early beta. Some features and content are still being refined."
        : "초기 베타 서비스입니다. 일부 기능과 콘텐츠를 계속 개선하고 있습니다."}</p>
    </section>

    <section className="public-section" id="how-it-works">
      <div className="public-section-head">
        <span>THE FOUNDATION</span>
        <h2>{en ? "Build something that stays." : "실행은 쌓이고, 기록은 남습니다."}</h2>
      </div>
      <div className="public-stage-grid">
        {stages.map(stage => <article key={stage.key} className="public-stage">
          <span>{stage.key}</span><h3>{stage.title}</h3><p>{stage.body}</p>
        </article>)}
      </div>
    </section>

    <section className="public-section public-connections">
      <div>
        <span className="public-kicker">FROM PROGRESS TO OPPORTUNITY</span>
        <h2>{en ? "More than a profile." : "프로필을 넘어, 실제 연결로."}</h2>
        <p>{en
          ? "Discover people who share your direction, join a TEAM, apply for opportunities, and record collaboration outcomes together."
          : "비슷한 방향으로 나아가는 사람을 발견하고, TEAM에 합류하고, 기회에 지원하고, 함께 만든 결과를 기록하세요."}</p>
      </div>
      <div className="public-connection-steps">
        <div>PEOPLE <span>01</span></div>
        <div>TEAM <span>02</span></div>
        <div>OPPORTUNITY <span>03</span></div>
      </div>
    </section>

    <section className="public-last">
      <p>{en ? "What will you build next?" : "당신은 이제 무엇을 쌓아갈 것입니까."}</p>
      <Link href="/login" className="public-primary">{en ? "Get started" : "시작하기"}</Link>
    </section>
    <footer className="public-footer">
      <span>© prof. · EARLY BETA</span>
      <span>{en ? "Member content appears in its original language. Evidence is not automatically verified." : "사용자 작성 콘텐츠는 원문으로 표시됩니다. 근거 첨부가 곧 공식 인증을 의미하지는 않습니다."}</span>
    </footer>
  </main>;
}
