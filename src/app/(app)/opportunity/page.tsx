import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { OpportunityCreator } from "@/components/opportunity-creator";
import { RecommendationActions } from "@/components/recommendation-actions";
import { opportunityMatch } from "@/lib/match";

export default async function OpportunityPage() {
  const { supabase, userId } = await requireUser();
  const [{ data: ops }, { data: rising }, { data: mine }, { data: feedback }] = await Promise.all([
    supabase.from("opportunities").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(30),
    supabase.from("public_team_momentum").select("*").order("momentum_score", { ascending: false }).limit(8),
    supabase.from("direction_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("recommendation_feedback").select("target_id,state").eq("user_id", userId).eq("target_type", "opportunity"),
  ]);

  const fmap = new Map((feedback ?? []).map((x: any) => [x.target_id, x.state]));
  const visibleOps = (ops ?? []).filter((o: any) => fmap.get(o.id) !== "dismissed");

  return (
    <>
      <header className="utility-head opportunity-head-simple">
        <div>
          <h1>기회</h1>
          <p>당신이 해온 것과 맞는 다음 기회를 찾습니다.</p>
        </div>
        <OpportunityCreator userId={userId} />
      </header>

      {visibleOps.length ? <section className="match-list">{visibleOps.map((o: any) => {
        const match = opportunityMatch(mine, o);
        return (
          <article className="match-card" key={o.id}>
            <div className="match-card-top">
              <div className="grow">
                <div className="mini-label">{String(o.domain).toUpperCase()} · {String(o.kind).toUpperCase()}</div>
                <h2>{o.title}</h2>
                <div className="match-org">{o.organization_name}{o.verified_organization ? " · Verified" : ""}</div>
              </div>
              {match && <span className="match-badge">{match.total}%</span>}
            </div>
            <p className="match-mission">{o.description}</p>
            <div className="match-card-actions">
              <Link className="btn primary" href={`/opportunity/${o.id}`}>기회 보기</Link>
              <RecommendationActions userId={userId} targetType="opportunity" targetId={o.id} initialState={(fmap.get(o.id) as "saved" | "dismissed" | undefined) ?? null} />
            </div>
          </article>
        );
      })}</section> : <div className="empty"><h3>아직 추천할 기회가 없습니다.</h3><p>활동과 기회 데이터가 쌓이면 더 잘 맞는 제안이 이곳에 나타납니다.</p></div>}

      {rising?.length ? <section className="discover-section opportunity-rising">
        <div className="section-title-row"><div><span>RISING TEAMS</span><h2>지금 움직이는 TEAM</h2></div></div>
        <div className="team-discovery-list">{rising.map((t: any) => (
          <Link href={`/team/${t.team_id}`} className="discover-row" key={t.team_id}>
            <div className="discover-symbol">T</div>
            <div className="grow"><div className="row-title"><b>{t.name}</b><span>{String(t.domain).toUpperCase()}</span></div><div className="meta">최근 Proof {t.proof_count_30d ?? 0} · {t.continuity_months ?? 0}개월 지속</div></div>
          </Link>
        ))}</div>
      </section> : null}
    </>
  );
}
