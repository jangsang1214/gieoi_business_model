import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { StartDmButton } from "@/components/start-dm-button";
import { TeamApplyButton } from "@/components/team-apply-button";
import { RecommendationActions } from "@/components/recommendation-actions";
import { personMatch } from "@/lib/match";

function proofLevel(rows: any[] = []) {
  if (rows.some((x) => x.kind === "organization_verified" && x.verified_at)) return "VERIFIED";
  if (rows.some((x) => x.kind === "team_confirmed" && x.verified_at)) return "TEAM";
  if (rows.some((x) => x.kind === "connected" && x.verified_at)) return "CONNECTED";
  if (rows.some((x) => x.kind === "evidence")) return "EVIDENCE";
  return "SELF";
}

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { supabase, userId } = await requireUser();
  const params = await searchParams;
  const q = String(params.q || "").trim();
  const pattern = `%${q.replace(/[%_,()]/g, "")} %`.replace(" %", "%");

  const peopleQuery = supabase
    .from("profiles")
    .select("id,display_name,handle,headline,primary_domains,open_to,affiliation_name,affiliation_role,affiliation_visible")
    .neq("id", userId)
    .eq("discoverable", true)
    .limit(30);

  const teamsQuery = supabase
    .from("teams")
    .select("id,name,mission,domain,current_stage,owner_id,team_members(count)")
    .eq("discoverable", true)
    .limit(20);

  const goalsQuery = supabase
    .from("goals")
    .select("id,title,why,domain,current_stage,created_at")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(10);

  const proofsQuery = supabase
    .from("proofs")
    .select("id,title,description,domain,happened_at,proof_provenance(kind,verified_at)")
    .eq("visibility", "public")
    .order("happened_at", { ascending: false })
    .limit(10);

  const [
    { data: people }, { data: teams }, { data: goals }, { data: proofs },
    { data: myProfile }, { data: myDirection }, { data: myGoals },
    { data: feedback }, { data: applications },
  ] = await Promise.all([
    q ? peopleQuery.or(`display_name.ilike.${pattern},handle.ilike.${pattern},headline.ilike.${pattern}`) : peopleQuery,
    q ? teamsQuery.or(`name.ilike.${pattern},mission.ilike.${pattern}`) : teamsQuery,
    q ? goalsQuery.or(`title.ilike.${pattern},why.ilike.${pattern}`) : goalsQuery,
    q ? proofsQuery.or(`title.ilike.${pattern},description.ilike.${pattern}`) : proofsQuery,
    supabase.from("profiles").select("primary_domains,open_to").eq("id", userId).single(),
    supabase.from("direction_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("goals").select("domain").eq("owner_id", userId).eq("status", "active"),
    supabase.from("recommendation_feedback").select("target_id,state").eq("user_id", userId).eq("target_type", "profile"),
    supabase.from("team_applications").select("team_id,status,created_at").eq("applicant_id", userId).order("created_at", { ascending: false }),
  ]);

  const personIds = (people || []).map((p: any) => p.id);
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [{ data: directions }, { data: personGoals }, { data: personProofs }, { data: recentRecords }] = personIds.length
    ? await Promise.all([
        supabase.from("direction_profiles").select("*").in("user_id", personIds),
        supabase.from("goals").select("owner_id,domain").in("owner_id", personIds).eq("status", "active"),
        supabase.from("proofs").select("owner_id,proof_provenance(kind,verified_at)").in("owner_id", personIds).eq("visibility", "public"),
        supabase.from("records").select("author_id").in("author_id", personIds).gte("occurred_at", cutoff).eq("visibility", "public"),
      ])
    : [{ data: [] as any[] }, { data: [] as any[] }, { data: [] as any[] }, { data: [] as any[] }];

  const dmap = new Map((directions || []).map((x: any) => [x.user_id, x]));
  const goalMap = new Map<string, string[]>();
  for (const g of personGoals || []) goalMap.set(g.owner_id, [...(goalMap.get(g.owner_id) || []), g.domain]);
  const proofMap = new Map<string, { count: number; verified: number }>();
  for (const p of personProofs || []) {
    const stats = proofMap.get(p.owner_id) || { count: 0, verified: 0 };
    stats.count += 1;
    if ((p.proof_provenance || []).some((x: any) => x.verified_at || x.kind === "evidence")) stats.verified += 1;
    proofMap.set(p.owner_id, stats);
  }
  const activityMap = new Map<string, number>();
  for (const r of recentRecords || []) activityMap.set(r.author_id, (activityMap.get(r.author_id) || 0) + 1);
  const feedbackMap = new Map((feedback || []).map((x: any) => [x.target_id, x.state]));
  const applicationMap = new Map<string, "pending" | "accepted" | "rejected" | "withdrawn">();
  for (const app of applications || []) if (!applicationMap.has(app.team_id)) applicationMap.set(app.team_id, app.status);

  const viewerSignal = {
    direction: myDirection,
    domains: myProfile?.primary_domains || [],
    openTo: myProfile?.open_to || [],
    goalDomains: (myGoals || []).map((g: any) => g.domain),
  };

  const rankedPeople = (people || [])
    .filter((p: any) => q || feedbackMap.get(p.id) !== "dismissed")
    .map((p: any) => {
      const stats = proofMap.get(p.id) || { count: 0, verified: 0 };
      return {
        profile: p,
        match: personMatch(viewerSignal, {
          direction: dmap.get(p.id) || null,
          domains: p.primary_domains || [],
          openTo: p.open_to || [],
          goalDomains: goalMap.get(p.id) || [],
          proofCount: stats.count,
          verifiedProofCount: stats.verified,
          recentRecords: activityMap.get(p.id) || 0,
        }),
      };
    })
    .sort((a: any, b: any) => q ? 0 : (b.match?.total ?? -1) - (a.match?.total ?? -1))
    .slice(0, 12);

  return <>
    <header className="utility-head"><div><h1>탐색</h1><p>사람과 TEAM을 발견합니다.</p></div></header>
    <form className="explore-search" action="/explore" method="get"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.2 4.2"/></svg><input name="q" defaultValue={q} placeholder="사람, TEAM, Goal, Proof 검색" aria-label="기어이 검색" />{q && <a href="/explore" className="search-clear">지우기</a>}</form>

    <section className="discover-section">
      <div className="section-title-row"><div><span>PEOPLE</span><h2>{q ? `“${q}”와 연결된 사람` : "For You"}</h2></div></div>
      {rankedPeople.length ? <div className="people-grid">{rankedPeople.map(({ profile: p, match }: any) => <article className="person-card person-match-card" key={p.id}>
        <Link href={`/profile/${p.id}`} className="person-card-link">
          <div className="person-top"><div className="avatar large">{String(p.display_name || p.handle || "?").slice(0, 1)}</div><div className="grow"><h3>{p.display_name || "기어이 사용자"}</h3><div className="meta">@{p.handle || "gieoi"}</div></div>{match && <span className="match-badge compact-match">{match.total}%</span>}</div>
          <p>{p.headline || (p.affiliation_visible && p.affiliation_name ? `${p.affiliation_name}${p.affiliation_role ? ` · ${p.affiliation_role}` : ""}` : "")}</p>
          <div className="badges">{(p.primary_domains || []).slice(0, 3).map((d: string) => <span className="badge" key={d}>{d.toUpperCase()}</span>)}</div>
        </Link>
        <div className="person-action person-action-v6"><StartDmButton me={userId} target={p.id} /><RecommendationActions userId={userId} targetType="profile" targetId={p.id} initialState={(feedbackMap.get(p.id) as "saved" | "dismissed" | undefined) ?? null} /></div>
      </article>)}</div> : <div className="compact-empty">조건에 맞는 사람을 아직 찾지 못했습니다.</div>}
    </section>

    <section className="discover-section">
      <div className="section-title-row"><div><span>TEAM</span><h2>함께 해낼 팀</h2></div></div>
      {teams?.length ? <div className="team-discovery-list">{teams.map((t: any) => <article className="discover-row" key={t.id}><Link href={`/team/${t.id}`} className="discover-row-link grow"><div className="row-title"><b>{t.name}</b><span>{String(t.domain).toUpperCase()}</span></div><p>{t.mission}</p><div className="meta">{t.current_stage || "Moving"} · {t.team_members?.[0]?.count ?? 0} people</div></Link>{t.owner_id !== userId ? <TeamApplyButton teamId={t.id} userId={userId} initialStatus={applicationMap.get(t.id) ?? null} /> : <Link href={`/team/${t.id}`} className="badge">내 TEAM</Link>}</article>)}</div> : <div className="compact-empty">아직 발견할 TEAM이 없습니다.</div>}
    </section>

    <section className="discover-section"><div className="section-title-row"><div><span>GOALS</span><h2>지금 향하는 곳</h2></div></div>{goals?.length ? <div className="discovery-stack">{goals.map((g: any) => <article className="evidence-row" key={g.id}><div><span className="mini-label">{String(g.domain).toUpperCase()}</span><h3>{g.title}</h3><p>{g.why}</p></div>{g.current_stage && <span className="stage-pill">{g.current_stage}</span>}</article>)}</div> : <div className="compact-empty">공개된 Goal이 아직 없습니다.</div>}</section>

    <section className="discover-section"><div className="section-title-row"><div><span>PROOF</span><h2>최근 남겨진 결과</h2></div></div>{proofs?.length ? <div className="discovery-stack">{proofs.map((p: any) => <article className="evidence-row" key={p.id}><div><span className="mini-label">{String(p.domain).toUpperCase()} · {new Date(p.happened_at).toLocaleDateString("ko-KR")}</span><h3>{p.title}</h3><p>{p.description}</p></div><span className="proof-level">{proofLevel(p.proof_provenance)}</span></article>)}</div> : <div className="compact-empty">공개된 Proof가 아직 없습니다.</div>}</section>
  </>;
}
