import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { OpportunityCreator } from "@/components/opportunity-creator";
import { RecommendationActions } from "@/components/recommendation-actions";
import { opportunityMatch } from "@/lib/match";
import {
  opportunityKinds, opportunityDomains, opportunityKindLabel,
  opportunityDomainLabel, opportunityReasons,
} from "@/lib/opportunity";

type Filters = { q?: string; domain?: string; kind?: string; view?: string };

function opportunityHref(filters: Filters) {
  const query = new URLSearchParams();
  if (filters.q) query.set("q", filters.q);
  if (filters.domain) query.set("domain", filters.domain);
  if (filters.kind) query.set("kind", filters.kind);
  if (filters.view && filters.view !== "all") query.set("view", filters.view);
  return query.size ? `/opportunity?${query.toString()}` : "/opportunity";
}

export default async function OpportunityPage({ searchParams }: {
  searchParams: Promise<Filters>;
}) {
  const { supabase, userId } = await requireUser();
  const params = await searchParams;
  const domain = opportunityDomains.some((item) => item.value === params.domain) ? params.domain! : "";
  const kind = opportunityKinds.some((item) => item.value === params.kind) ? params.kind! : "";
  const view = params.view === "matched" || params.view === "saved" ? params.view : "all";
  // Keep the PostgREST OR filter restricted to a safe literal substring.
  const q = String(params.q ?? "").trim().replace(/[%_,().\\]/g, "").slice(0, 70);
  const pattern = `%${q}%`;

  let query = supabase.from("opportunities")
    .select("id,title,description,organization_name,kind,domain,status,created_at,created_by,verified_organization,required_skills,desired_future_tags,desired_stage,minimum_verified_proofs,minimum_team_months")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(100);
  if (domain) query = query.eq("domain", domain);
  if (kind) query = query.eq("kind", kind);
  if (q) query = query.or(`title.ilike.${pattern},description.ilike.${pattern},organization_name.ilike.${pattern}`);

  const [
    { data: opportunities, error: opportunityError },
    { data: rising },
    { data: mine },
    { data: feedback },
  ] = await Promise.all([
    query,
    supabase.from("public_team_momentum").select("team_id,name,domain,proof_count_30d,continuity_months,momentum_score").order("momentum_score", { ascending: false }).limit(6),
    supabase.from("direction_profiles").select("future_tags,skill_tags,preferred_domains,stage,verified_evidence_count,team_continuity_months,active_weeks_12").eq("user_id", userId).maybeSingle(),
    supabase.from("recommendation_feedback").select("target_id,state").eq("user_id", userId).eq("target_type", "opportunity"),
  ]);

  const states = new Map((feedback ?? []).map((item) => [item.target_id, item.state]));
  const entries = (opportunities ?? []).map((item) => {
    const reasons = opportunityReasons(mine, item);
    const score = reasons.length ? (opportunityMatch(mine, item)?.total ?? 0) : 0;
    return { item, reasons, score };
  }).filter(({ item, reasons }) => {
    if (states.get(item.id) === "dismissed") return false;
    if (view === "saved") return states.get(item.id) === "saved";
    if (view === "matched") return reasons.length > 0;
    return true;
  }).sort((a, b) => {
    if (view === "all" || view === "matched") {
      return b.score - a.score || +new Date(b.item.created_at) - +new Date(a.item.created_at);
    }
    return +new Date(b.item.created_at) - +new Date(a.item.created_at);
  });

  return (
    <>
      <header className="utility-head opportunity-head-simple">
        <div><h1>기회</h1><p>해온 일에서 다음 기회를 발견하세요.</p></div>
        <OpportunityCreator userId={userId} />
      </header>

      <nav className="tabs" aria-label="기회 보기">
        {[
          ["all", "전체 기회"],
          ["matched", "나와 맞는 기회"],
          ["saved", "저장한 기회"],
        ].map(([value, label]) =>
          <Link key={value} className={`pill ${view === value ? "active" : ""}`}
            href={opportunityHref({ q, domain, kind, view: value })}>{label}</Link>
        )}
      </nav>

      <form className="opportunity-filters" action="/opportunity" method="get">
        <label className="field opportunity-search-field">
          <span>기회 검색</span>
          <input name="q" defaultValue={q} maxLength={70} placeholder="프로젝트, 공모전, 채용, 협업..." />
        </label>
        <label className="field">
          <span>분야</span>
          <select name="domain" defaultValue={domain}>
            <option value="">모든 분야</option>
            {opportunityDomains.map((entry) =>
              <option key={entry.value} value={entry.value}>{entry.label}</option>
            )}
          </select>
        </label>
        <label className="field">
          <span>유형</span>
          <select name="kind" defaultValue={kind}>
            <option value="">모든 기회</option>
            {opportunityKinds.map((entry) =>
              <option key={entry.value} value={entry.value}>{entry.label}</option>
            )}
          </select>
        </label>
        <input type="hidden" name="view" value={view} />
        <button className="btn secondary opportunity-filter-submit" type="submit">찾기</button>
      </form>

      {opportunityError && <div className="error notice" role="alert">
        기회를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
      </div>}

      {entries.length ? <section className="match-list" aria-label="기회 목록">
        {entries.map(({ item, reasons }) =>
          <article className="match-card" key={item.id}>
            <div className="match-card-top">
              <div className="grow">
                <div className="mini-label">{opportunityDomainLabel(item.domain)} · {opportunityKindLabel(item.kind)}</div>
                <h2>{item.title}</h2>
                <div className="match-org">
                  {item.organization_name}
                  {item.verified_organization && <span> · 인증된 기관</span>}
                </div>
              </div>
            </div>
            <p className="match-mission">{item.description}</p>
            {reasons.length > 0 && <div className="opportunity-match-reason">
              <b>추천 이유</b><span>{reasons[0]}</span>
            </div>}
            <div className="match-card-actions">
              <Link className="btn primary" href={`/opportunity/${item.id}`}>자세히 보기</Link>
              <RecommendationActions userId={userId} targetType="opportunity" targetId={item.id}
                initialState={(states.get(item.id) as "saved" | "dismissed" | undefined) ?? null} />
            </div>
          </article>
        )}
      </section> : !opportunityError && <div className="empty">
        <h3>{view === "saved" ? "저장한 기회가 없습니다." : view === "matched" ? "아직 일치하는 기회가 없어요." : "아직 등록된 기회가 없어요."}</h3>
        <p>{view === "matched"
          ? "내 삶에서 관심 분야와 역량을 설정하거나 전체 기회를 살펴보세요. 정보가 부족한 것을 낮은 점수로 판단하지 않습니다."
          : view === "saved"
            ? "관심 있는 기회를 저장하면 이곳에서 다시 볼 수 있어요."
            : "첫 프로젝트나 모집 공고를 등록하거나 TEAM을 발견해 보세요."}</p>
        <Link className="inline-action" href={view === "all" ? "/team" : "/opportunity"}>{view === "all" ? "TEAM 탐색하기" : "전체 기회 보기"} →</Link>
      </div>}

      {rising?.length ? <section className="discover-section opportunity-rising">
        <div className="section-title-row">
          <div><span>RISING TEAMS</span><h2>지금 움직이는 TEAM</h2></div>
          <Link href="/team" className="inline-action">TEAM 더 보기 →</Link>
        </div>
        <div className="team-discovery-list">{rising.map((team) =>
          <Link href={`/team/${team.team_id}`} className="discover-row" key={team.team_id}>
            <div className="discover-symbol">T</div>
            <div className="grow"><div className="row-title">
              <b>{team.name}</b><span>{opportunityDomainLabel(team.domain)}</span>
            </div><div className="meta">최근 Proof {team.proof_count_30d ?? 0} · {team.continuity_months ?? 0}개월 지속</div></div>
          </Link>
        )}</div>
      </section> : null}
    </>
  );
}
