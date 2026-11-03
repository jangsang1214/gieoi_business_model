import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { StartDmButton } from "@/components/start-dm-button";
import { TeamApplyButton } from "@/components/team-apply-button";
import { RecommendationActions } from "@/components/recommendation-actions";
import { personMatch } from "@/lib/match";

const domains = ["business", "workout", "create", "study", "career", "lifestyle"];

function hrefForDomain(domain: string, q: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (domain) params.set("domain", domain);
  const suffix = params.toString();
  return suffix ? `/explore?${suffix}` : "/explore";
}

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string; domain?: string }> }) {
  const { supabase, userId } = await requireUser();
  const params = await searchParams;
  const q = String(params.q || "").trim();
  const domain = domains.includes(String(params.domain || "").toLowerCase()) ? String(params.domain).toLowerCase() : "";
  const pattern = `%${q.replace(/[%_,()]/g, "")}%`;

  let recordsQuery = supabase
    .from("records")
    .select("id,body,domain,type,occurred_at,author_id,goal_id,team_id,profiles!records_author_id_fkey(display_name,handle,headline,avatar_url),goals(id,title),teams(id,name)")
    .eq("visibility", "public")
    .neq("author_id", userId)
    .order("occurred_at", { ascending: false })
    .limit(60);
  if (q) recordsQuery = recordsQuery.ilike("body", pattern);
  if (domain) recordsQuery = recordsQuery.eq("domain", domain);

  const peopleQuery = supabase
    .from("profiles")
    .select("id,display_name,handle,headline,primary_domains,open_to,affiliation_name,affiliation_role,affiliation_visible")
    .neq("id", userId)
    .eq("discoverable", true)
    .limit(24);

  const teamsQuery = supabase
    .from("teams")
    .select("id,name,mission,domain,current_stage,owner_id,team_members(count)")
    .eq("discoverable", true)
    .limit(16);

  const [
    { data: records }, { data: people }, { data: teams },
    { data: myProfile }, { data: myDirection }, { data: myGoals },
    { data: feedback }, { data: applications },
  ] = await Promise.all([
    recordsQuery,
    q ? peopleQuery.or(`display_name.ilike.${pattern},handle.ilike.${pattern},headline.ilike.${pattern}`) : peopleQuery,
    q ? teamsQuery.or(`name.ilike.${pattern},mission.ilike.${pattern}`) : teamsQuery,
    supabase.from("profiles").select("primary_domains,open_to").eq("id", userId).single(),
    supabase.from("direction_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("goals").select("domain").eq("owner_id", userId).eq("status", "active"),
    supabase.from("recommendation_feedback").select("target_id,state").eq("user_id", userId).eq("target_type", "profile"),
    supabase.from("team_applications").select("team_id,status,created_at").eq("applicant_id", userId).order("created_at", { ascending: false }),
  ]);

  const recordIds = (records || []).map((r: any) => r.id);
  const { data: linkedProofs } = recordIds.length
    ? await supabase.from("proofs").select("id,title,record_id").in("record_id", recordIds).eq("visibility", "public")
    : { data: [] as any[] };
  const proofByRecord = new Map((linkedProofs || []).map((p: any) => [p.record_id, p]));

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
    .slice(0, 6);

  return <>
    <header className="utility-head explore-head-v7">
      <div><h1>탐색</h1><p>다른 사람들이 지금 살아내고 있는 것을 발견합니다.</p></div>
    </header>

    <form className="explore-search" action="/explore" method="get">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.2 4.2"/></svg>
      <input name="q" defaultValue={q} placeholder="기록, 사람, TEAM 검색" aria-label="기어이 검색" />
      {domain && <input type="hidden" name="domain" value={domain} />}
      {(q || domain) && <a href="/explore" className="search-clear">지우기</a>}
    </form>

    <nav className="explore-domain-tabs" aria-label="기록 분야">
      <Link className={!domain ? "active" : ""} href={hrefForDomain("", q)}>전체</Link>
      {domains.map((d) => <Link className={domain === d ? "active" : ""} key={d} href={hrefForDomain(d, q)}>{d.toUpperCase()}</Link>)}
    </nav>

    <section className="discover-section explore-record-section">
      <div className="section-title-row"><div><span>DISCOVER</span><h2>{q ? `“${q}”의 공개 기록` : domain ? `${domain.toUpperCase()}에서 살아가는 사람들` : "지금, 다른 사람들의 삶"}</h2></div><small>{records?.length || 0} records</small></div>
      {records?.length ? <div className="explore-record-feed">{records.map((r: any) => {
        const author = r.profiles;
        const proof = proofByRecord.get(r.id) as any;
        return <article className="explore-record-card" key={r.id}>
          <div className="explore-record-author">
            <Link href={`/profile/${r.author_id}`} className="explore-author-link">
              <div className="avatar">{String(author?.display_name || author?.handle || "?").slice(0, 1)}</div>
              <div className="grow"><div className="post-user-line"><b>{author?.display_name || author?.handle || "기어이 사용자"}</b>{author?.handle && <span>@{author.handle}</span>}</div><div className="meta">{new Date(r.occurred_at).toLocaleDateString("ko-KR")} · {String(r.domain).toUpperCase()}</div></div>
            </Link>
            {r.type === "proof" && <span className="proof-level">PROOF</span>}
          </div>

          <p className="explore-record-body">{r.body}</p>

          <div className="explore-context-links">
            {r.goals?.id && <Link href={`/goal/${r.goals.id}`} className="chip">Goal · {r.goals.title}</Link>}
            {r.teams?.id && <Link href={`/team/${r.teams.id}`} className="chip">TEAM · {r.teams.name}</Link>}
            {proof?.id && <Link href={`/proof/${proof.id}`} className="chip proof-chip">Proof · {proof.title}</Link>}
          </div>

          <div className="explore-record-foot">
            <Link href={`/profile/${r.author_id}`}>프로필 보기</Link>
            {r.teams?.id && <Link href={`/team/${r.teams.id}`}>TEAM 보기</Link>}
          </div>
        </article>;
      })}</div> : <div className="empty feed-empty"><h3>아직 발견할 공개 기록이 없습니다.</h3><p>다른 분야를 보거나 검색어를 바꿔보세요.</p></div>}
    </section>

    <section className="discover-section explore-secondary-section">
      <div className="section-title-row"><div><span>PEOPLE</span><h2>기록 뒤의 사람들</h2></div><Link href="/explore" className="meta">추천</Link></div>
      {rankedPeople.length ? <div className="people-grid">{rankedPeople.map(({ profile: p, match }: any) => <article className="person-card person-match-card" key={p.id}>
        <Link href={`/profile/${p.id}`} className="person-card-link">
          <div className="person-top"><div className="avatar large">{String(p.display_name || p.handle || "?").slice(0, 1)}</div><div className="grow"><h3>{p.display_name || "기어이 사용자"}</h3><div className="meta">@{p.handle || "gieoi"}</div></div>{match && <span className="match-badge compact-match">{match.total}%</span>}</div>
          <p>{p.headline || (p.affiliation_visible && p.affiliation_name ? `${p.affiliation_name}${p.affiliation_role ? ` · ${p.affiliation_role}` : ""}` : "")}</p>
          <div className="badges">{(p.primary_domains || []).slice(0, 3).map((d: string) => <span className="badge" key={d}>{d.toUpperCase()}</span>)}</div>
        </Link>
        <div className="person-action person-action-v6"><StartDmButton me={userId} target={p.id} /><RecommendationActions userId={userId} targetType="profile" targetId={p.id} initialState={(feedbackMap.get(p.id) as "saved" | "dismissed" | undefined) ?? null} /></div>
      </article>)}</div> : <div className="compact-empty">조건에 맞는 사람을 아직 찾지 못했습니다.</div>}
    </section>

    <section className="discover-section explore-secondary-section">
      <div className="section-title-row"><div><span>TEAM</span><h2>함께 해낼 팀</h2></div></div>
      {teams?.length ? <div className="team-discovery-list">{teams.slice(0, 6).map((t: any) => <article className="discover-row" key={t.id}><Link href={`/team/${t.id}`} className="discover-row-link grow"><div className="row-title"><b>{t.name}</b><span>{String(t.domain).toUpperCase()}</span></div><p>{t.mission}</p><div className="meta">{t.current_stage || "Moving"} · {t.team_members?.[0]?.count ?? 0} people</div></Link>{t.owner_id !== userId ? <TeamApplyButton teamId={t.id} userId={userId} initialStatus={applicationMap.get(t.id) ?? null} /> : <Link href={`/team/${t.id}`} className="badge">내 TEAM</Link>}</article>)}</div> : <div className="compact-empty">아직 발견할 TEAM이 없습니다.</div>}
    </section>
  </>;
}
