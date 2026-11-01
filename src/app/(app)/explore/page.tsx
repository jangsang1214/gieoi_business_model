import { requireUser } from "@/lib/auth";
import { StartDmButton } from "@/components/start-dm-button";
import { TeamApplyButton } from "@/components/team-apply-button";

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
    .select("id,display_name,handle,headline,domains,open_to")
    .neq("id", userId)
    .eq("discoverable", true)
    .limit(12);

  const teamsQuery = supabase
    .from("teams")
    .select("id,name,mission,domain,current_stage,owner_id,team_members(count)")
    .eq("discoverable", true)
    .limit(12);

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

  const [{ data: people }, { data: teams }, { data: goals }, { data: proofs }] = await Promise.all([
    q ? peopleQuery.or(`display_name.ilike.${pattern},handle.ilike.${pattern},headline.ilike.${pattern}`) : peopleQuery,
    q ? teamsQuery.or(`name.ilike.${pattern},mission.ilike.${pattern}`) : teamsQuery,
    q ? goalsQuery.or(`title.ilike.${pattern},why.ilike.${pattern}`) : goalsQuery,
    q ? proofsQuery.or(`title.ilike.${pattern},description.ilike.${pattern}`) : proofsQuery,
  ]);

  return (
    <>
      <header className="utility-head">
        <div>
          <h1>탐색</h1>
          <p>관심사가 아니라, 실제로 움직이는 방향으로 사람과 TEAM을 발견합니다.</p>
        </div>
      </header>

      <form className="explore-search" action="/explore" method="get">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.2 4.2"/></svg>
        <input name="q" defaultValue={q} placeholder="사람, TEAM, Goal, Proof 검색" aria-label="기어이 검색" />
        {q && <a href="/explore" className="search-clear">지우기</a>}
      </form>

      <div className="discover-tabs" aria-label="탐색 범주">
        <span className="active">전체</span><span>사람</span><span>TEAM</span><span>Goal</span><span>Proof</span>
      </div>

      <section className="discover-section">
        <div className="section-title-row"><div><span>PEOPLE</span><h2>{q ? `“${q}”와 연결된 사람` : "지금 움직이는 사람"}</h2></div><small>살아온 방향으로 발견</small></div>
        {people?.length ? <div className="people-grid">{people.map((p: any) => (
          <article className="person-card" key={p.id}>
            <div className="person-top"><div className="avatar large">{String(p.display_name || p.handle || "?").slice(0, 1)}</div><div className="grow"><h3>{p.display_name || "기어이 사용자"}</h3><div className="meta">@{p.handle || "gieoi"}</div></div></div>
            <p>{p.headline || "자신의 방향을 실제 과정으로 쌓아가고 있습니다."}</p>
            <div className="badges">{(p.domains || []).slice(0, 3).map((d: string) => <span className="badge" key={d}>{d.toUpperCase()}</span>)}</div>
            <div className="person-action"><StartDmButton me={userId} target={p.id} /></div>
          </article>
        ))}</div> : <div className="compact-empty">조건에 맞는 사람을 아직 찾지 못했습니다.</div>}
      </section>

      <section className="discover-section">
        <div className="section-title-row"><div><span>TEAMS</span><h2>같이 갈 TEAM</h2></div><small>미션과 현재 단계 중심</small></div>
        {teams?.length ? <div className="team-discovery-list">{teams.map((t: any) => (
          <article className="discover-row" key={t.id}>
            <div className="discover-symbol">T</div>
            <div className="grow"><div className="row-title"><b>{t.name}</b><span>{String(t.domain).toUpperCase()}</span></div><p>{t.mission}</p><div className="meta">{t.current_stage || "Moving"} · {t.team_members?.[0]?.count ?? 0} people</div></div>
            {t.owner_id !== userId ? <TeamApplyButton teamId={t.id} userId={userId} /> : <span className="badge">내 TEAM</span>}
          </article>
        ))}</div> : <div className="compact-empty">아직 발견할 TEAM이 없습니다.</div>}
      </section>

      <section className="discover-section">
        <div className="section-title-row"><div><span>GOALS</span><h2>사람들이 지금 향하는 곳</h2></div></div>
        {goals?.length ? <div className="discovery-stack">{goals.map((g: any) => (
          <article className="evidence-row" key={g.id}><div><span className="mini-label">{String(g.domain).toUpperCase()}</span><h3>{g.title}</h3><p>{g.why}</p></div>{g.current_stage && <span className="stage-pill">{g.current_stage}</span>}</article>
        ))}</div> : <div className="compact-empty">공개된 Goal이 아직 없습니다.</div>}
      </section>

      <section className="discover-section">
        <div className="section-title-row"><div><span>PROOF</span><h2>최근 남겨진 근거</h2></div><small>말보다 실제 결과</small></div>
        {proofs?.length ? <div className="discovery-stack">{proofs.map((p: any) => (
          <article className="evidence-row" key={p.id}><div><span className="mini-label">{String(p.domain).toUpperCase()} · {new Date(p.happened_at).toLocaleDateString("ko-KR")}</span><h3>{p.title}</h3><p>{p.description}</p></div><span className="proof-level">{proofLevel(p.proof_provenance)}</span></article>
        ))}</div> : <div className="compact-empty">공개된 Proof가 아직 없습니다.</div>}
      </section>
    </>
  );
}
