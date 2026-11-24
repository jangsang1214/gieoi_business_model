import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { LocaleSwitcher } from "@/components/locale-switcher";

export const metadata: Metadata = {
  title: "Prof. | 목표, 활동 기록, 팀원 모집과 프로젝트 기회",
  description: "Prof.는 목표(Goal) 설정, 과정(Journey)과 성과(Proof) 기록, 사람 탐색·메시지, TEAM 모집·가입, 프로젝트·채용·협업 기회 등록·지원이 가능한 소셜 네트워크입니다.",
  openGraph: {
    title: "Prof. | Record your work. Find people and opportunities.",
    description: "Set Goals, share Journey updates, document Proof, discover people, form TEAMs and apply for Opportunities.",
    type: "website",
  },
};

export default async function AboutPage() {
  const locale = await getLocale();
  const en = locale === "en";

  const features = en ? [
    { key:"01 / GOAL",title:"Set a Goal",body:"Create a goal in business, fitness, study, art, career or lifestyle. Describe what you are working toward." },
    { key:"02 / JOURNEY",title:"Post progress",body:"Write updates and attach images. Link a post to a Goal or TEAM and choose who can see it." },
    { key:"03 / PROOF",title:"Document a result",body:"Record a finished project or milestone, with context and supporting evidence where available. Self-reported results are not automatically verified." },
    { key:"04 / PEOPLE",title:"Find and talk to people",body:"Explore profiles and activity, follow other members, comment on records or send direct messages." },
    { key:"05 / TEAM",title:"Build a team",body:"Create a TEAM, publish a mission, recruit members, apply to join and review applications." },
    { key:"06 / OPPORTUNITY",title:"Post and apply",body:"Explore or publish project, job, research and collaboration opportunities. Submit an application and review its status." },
  ] : [
    { key:"01 / GOAL",title:"목표 등록",body:"창업·운동·공부·창작·커리어·라이프스타일 중 분야를 선택해 목표와 이유를 기록합니다." },
    { key:"02 / JOURNEY",title:"진행 과정 게시",body:"그날 한 일과 사진을 게시합니다. Goal이나 TEAM에 연결하고 공개 범위도 선택할 수 있습니다." },
    { key:"03 / PROOF",title:"성과 기록",body:"완성한 결과물이나 달성한 기록을 남깁니다. 근거를 첨부할 수 있지만 본인 작성 기록이 자동으로 공식 인증되는 것은 아닙니다." },
    { key:"04 / PEOPLE",title:"사람 찾기와 대화",body:"다른 사람의 프로필·게시물을 살펴보고 팔로우, 댓글, 좋아요, 1:1 메시지로 소통합니다." },
    { key:"05 / TEAM",title:"팀원 모집과 합류",body:"팀 이름·활동 분야·목표를 정해 TEAM을 만들고, 지원을 받거나 다른 TEAM에 가입 신청을 합니다." },
    { key:"06 / OPPORTUNITY",title:"기회 등록과 지원",body:"프로젝트·채용·연구·협업 등의 모집 공고를 살펴보고 지원하거나 직접 등록해 지원자를 검토합니다." },
  ];

  const scenarios = en ? [
    { title:"Building a product", body:"Set a launch Goal → share development updates → document the completed MVP → find a designer or invite teammates." },
    { title:"Training or learning", body:"Set a training or study Goal → log sessions and milestones → show progress on your profile → find people working toward similar goals." },
    { title:"Joining a project", body:"Explore a TEAM or Opportunity → review the organizer's description → apply → talk through messages → record outcomes with collaborators." },
  ] : [
    { title:"앱을 개발하는 사람",body:"‘MVP 출시’ Goal을 만들고 개발 일지를 남깁니다. 출시 결과를 Proof로 기록한 뒤 디자이너를 찾거나 TEAM을 모집할 수 있습니다." },
    { title:"운동하거나 공부하는 사람",body:"대회 출전이나 자격증 취득을 목표로 정하고 훈련·학습 과정을 기록합니다. 비슷한 목표를 가진 사람을 발견할 수 있습니다." },
    { title:"프로젝트에 합류하려는 사람",body:"TEAM·Opportunity에서 모집 내용을 확인하고 지원합니다. 메시지로 소통하고 협업 이후의 결과도 함께 기록할 수 있습니다." },
  ];

  return <main className="public-page">
    <header className="public-top">
      <Link className="public-brand" href="/about">Prof<span>.</span></Link>
      <div className="public-header-actions">
        <LocaleSwitcher locale={locale} compact/>
        <Link href="/login" className="public-sign-in">{en ? "Log in" : "로그인"}</Link>
      </div>
    </header>

    <section className="public-hero">
      <p className="public-kicker">Prof. · GOAL / JOURNEY / PROOF / PEOPLE / TEAM / OPPORTUNITY</p>
      <h1>{en ? <>Record your work.<br/>Find your people.</> : <>목표를 기록하고,<br/>함께할 사람을 찾으세요.</>}</h1>
      <p className="public-intro">{en
        ? "Prof. is a social network where you set goals, publish progress and results, discover people and teams, and apply for projects or collaboration opportunities."
        : "Prof.는 목표를 세우고, 실행 과정과 성과를 게시하고, 다른 사람의 활동을 확인하며, TEAM 모집과 프로젝트·협업 기회에 지원할 수 있는 소셜 네트워크입니다."}</p>
      <div className="public-hero-actions">
        <Link href="/login" className="public-primary">{en ? "Start using Prof." : "Prof. 시작하기"}</Link>
        <a href="#how-it-works" className="public-secondary">{en ? "See what you can do" : "기능 자세히 보기"}</a>
        <Link href="/for-teams" className="public-secondary">{en ? "For TEAM organizers" : "팀 운영자라면"}</Link>
      </div>
      <p className="public-helper">{en
        ? "Early beta · Member-created information is not automatically authenticated or fact-checked."
        : "초기 베타 서비스 · 사용자 작성 게시물과 성과가 자동으로 사실 확인되거나 공식 인증되지는 않습니다."}</p>
    </section>

    <section className="public-section" id="how-it-works">
      <div className="public-section-head">
        <span>WHAT YOU CAN DO</span>
        <h2>{en ? "Six things you can actually do." : "Prof.에서 실제로 할 수 있는 일"}</h2>
      </div>
      <div className="public-stage-grid">
        {features.map(feature => <article key={feature.key} className="public-stage">
          <span>{feature.key}</span><h3>{feature.title}</h3><p>{feature.body}</p>
        </article>)}
      </div>
    </section>

    <section className="public-section">
      <div className="public-section-head">
        <span>REAL USE CASES</span>
        <h2>{en ? "How members can use Prof." : "사용 상황별 예시"}</h2>
      </div>
      <div className="public-stage-grid public-scenario-grid">
        {scenarios.map((item) => <article key={item.title} className="public-stage public-scenario">
          <h3>{item.title}</h3><p>{item.body}</p>
        </article>)}
      </div>
    </section>

    <section className="public-section public-connections">
      <div>
        <span className="public-kicker">FIND · APPLY · COLLABORATE</span>
        <h2>{en ? "From a post to a conversation, team or opportunity." : "단순 피드에서 끝나지 않도록."}</h2>
        <p>{en
          ? "See someone's work, visit their profile, follow or message them. You can also apply to join TEAMs and Opportunities, with owners reviewing applications."
          : "활동 기록을 보고 프로필을 방문해 팔로우하거나 메시지를 보낼 수 있습니다. 함께할 팀을 찾고 지원하거나 모집 공고를 등록해 지원자를 검토할 수도 있습니다."}</p>
      </div>
      <div className="public-connection-steps">
        <div>PEOPLE <span>탐색 / DISCOVER</span></div>
        <div>TEAM <span>모집 / JOIN</span></div>
        <div>OPPORTUNITY <span>지원 / APPLY</span></div>
      </div>
    </section>

    <section className="public-last">
      <p>{en ? "Start with one Goal or update." : "Goal 하나, 기록 하나부터 시작하세요."}</p>
      <Link href="/login" className="public-primary">{en ? "Create an account" : "계정 만들기"}</Link>
    </section>

    <footer className="public-footer">
      <span>© Prof. · EARLY BETA</span>
      <span>{en
        ? "Content is user-authored, displayed in its original language, and not automatically officially verified."
        : "게시물은 사용자가 작성하며 원문으로 표시됩니다. 성과 기록의 근거가 공식 인증을 보장하지는 않습니다."}</span>
    </footer>
  </main>;
}
