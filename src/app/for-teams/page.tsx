import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { LocaleSwitcher } from "@/components/locale-switcher";

export const metadata: Metadata = {
  title: "Prof. for Teams | 프로젝트 팀원 모집과 지원 관리",
  description: "Prof.에서 프로젝트·공모전·스터디 TEAM을 만들고 모집 내용을 게시하세요. 지원자가 남긴 활동 기록을 살펴보고 메시지로 대화할 수 있습니다. 현재 무료 베타 검증 단계입니다.",
};

export default async function ForTeamsPage() {
  const locale = await getLocale();
  const en = locale === "en";

  const steps = en ? [
    ["01", "Describe your TEAM", "Set a mission, category and current stage, then publish the TEAM page."],
    ["02", "Invite applications", "Open roles and share your recruiting page with people you'd like to meet."],
    ["03", "Review real profiles", "Read an applicant's public Goals, Journey posts and self-reported Proof to understand their experience."],
    ["04", "Talk and decide", "Use in-app messages, review applications and decide who to work with."],
  ] : [
    ["01", "TEAM 만들기", "팀의 목표와 분야, 진행 단계를 입력해 팀 소개 페이지를 만듭니다."],
    ["02", "팀원 모집하기", "필요한 역할과 모집 내용을 등록하고 관심 있는 사람에게 모집 페이지를 공유합니다."],
    ["03", "지원자 기록 보기", "지원자가 공개한 Goal·Journey·Proof를 확인해 무엇을 해왔는지 살펴봅니다."],
    ["04", "대화하고 합류 결정", "지원 내용을 검토하고 메시지로 이야기한 뒤 팀 참여 여부를 결정합니다."],
  ];

  return <main className="public-page">
    <header className="public-top">
      <Link className="public-brand" href="/about" aria-label="Prof.">Prof<span>.</span></Link>
      <div className="public-header-actions">
        <LocaleSwitcher locale={locale} compact />
        <Link href="/about" className="public-sign-in">{en ? "About Prof." : "서비스 소개"}</Link>
        <Link href="/login" className="public-sign-in">{en ? "Log in" : "로그인"}</Link>
      </div>
    </header>

    <section className="public-hero team-business-hero">
      <p className="public-kicker">PROF. FOR TEAMS · EARLY BETA</p>
      <h1>{en ? <>Find people who build.<br />Not just profiles.</> : <>같이 해낼 사람을,<br />실제 활동을 보고 찾으세요.</>}</h1>
      <p className="public-intro">{en
        ? "Prof. helps project organizers publish their TEAM, recruit members, review applicants' visible activity and start conversations in one place."
        : "Prof.는 프로젝트·공모전·창업·스터디 팀 운영자가 TEAM을 만들고 팀원을 모집하며, 지원자의 공개 활동을 확인하고 대화를 시작하는 서비스입니다."}</p>
      <p className="public-helper">{en
        ? "This is an early beta. All members' achievements are self-reported unless separately evidenced, and a good match is not guaranteed."
        : "현재 초기 무료 베타입니다. 사용자가 남긴 성과는 별도의 확인이 없는 한 자기 기록이며, 추천이나 모집 성공을 보장하지 않습니다."}</p>
      <div className="public-hero-actions">
        <Link href="/login" className="public-primary">{en ? "Start free beta" : "무료 베타 시작하기"}</Link>
        <a href="#team-process" className="public-secondary">{en ? "See the process" : "모집 과정 살펴보기"}</a>
      </div>
    </section>

    <section className="public-section" id="team-process">
      <div className="public-section-head"><span>HOW IT WORKS</span>
        <h2>{en ? "A concrete recruiting workflow" : "팀원 모집은 이렇게 진행됩니다"}</h2>
      </div>
      <div className="public-stage-grid">
        {steps.map(([number,title,description]) => <article className="public-stage" key={number}>
          <span>{number} / TEAM</span>
          <h3>{title}</h3><p>{description}</p>
        </article>)}
      </div>
    </section>

    <section className="public-section public-connections">
      <div>
        <span className="public-kicker">WHO THIS IS FOR</span>
        <h2>{en ? "Start with small, active project teams." : "처음에는 실제 프로젝트 팀부터."}</h2>
        <p>{en
          ? "We're validating Prof. with hackathon teams, university clubs, student founders and small collaborative projects before introducing paid features."
          : "해커톤 참가팀, 대학 동아리, 학생 창업팀, 사이드 프로젝트팀을 첫 검증 대상으로 삼습니다. 먼저 팀이 실제 지원자를 찾고 대화하는지 확인합니다."}</p>
      </div>
      <div className="public-connection-steps">
        <div>HACKATHON <span>{en ? "Build a team" : "해커톤 팀원 모집"}</span></div>
        <div>PROJECT <span>{en ? "Find collaborators" : "사이드 프로젝트 협업"}</span></div>
        <div>UNIVERSITY <span>{en ? "Work together" : "동아리·스터디 팀 운영"}</span></div>
      </div>
    </section>

    <section className="public-section">
      <div className="public-section-head"><span>PRICING STATUS</span>
        <h2>{en ? "Free beta now. Paid tools only after validation." : "현재 무료 베타, 유료 기능은 검증 후."}</h2>
      </div>
      <div className="team-business-pricing">
        <div className="public-stage">
          <span>BETA · AVAILABLE</span>
          <h3>{en ? "Free pilot" : "무료 팀 모집 베타"}</h3>
          <p>{en
            ? "Create a TEAM and explore existing recruiting, application review and messaging flows. No card or subscription is required."
            : "TEAM 생성, 기존 팀원 모집·지원 검토·메시지 기능을 시험할 수 있습니다. 카드 등록이나 구독 결제는 없습니다."}</p>
        </div>
        <div className="public-stage">
          <span>PAID · NOT LAUNCHED</span>
          <h3>{en ? "Team operator pilot" : "팀 운영 지원 유료 파일럿"}</h3>
          <p>{en
            ? "Potential hands-on onboarding and recruiting support will be offered only after demand, terms, payment and privacy processes are verified. No purchases are taken here."
            : "팀 온보딩·모집 운영 지원의 유료화 가능성을 고객 인터뷰로 검증 중입니다. 가격·약관·결제 절차가 확정되지 않았으며 이 페이지에서는 결제받지 않습니다."}</p>
        </div>
      </div>
    </section>

    <section className="public-last">
      <p>{en ? "Have a project and need a teammate?" : "지금 팀원을 구할 프로젝트가 있나요?"}</p>
      <Link href="/login" className="public-primary">{en ? "Try Prof. for free" : "무료로 TEAM 시작하기"}</Link>
    </section>
    <footer className="public-footer">
      <span>© Prof. · EARLY BETA</span>
      <span>{en ? "Do not submit sensitive applicant information. Recruiting decisions remain with the TEAM owner."
        : "지원자에 대한 민감정보를 업로드하지 마세요. 모집·선발 결정은 TEAM 운영자가 직접 수행합니다."}</span>
    </footer>
  </main>;
}
