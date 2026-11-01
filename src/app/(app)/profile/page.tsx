import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { GoalForm } from "@/components/goal-form";
import { DirectionEditor } from "@/components/direction-editor";

const level = (rows: any[] = []) => rows.some((x) => x.kind === "organization_verified" && x.verified_at)
  ? "ORG VERIFIED"
  : rows.some((x) => x.kind === "team_confirmed" && x.verified_at)
    ? "TEAM CONFIRMED"
    : rows.some((x) => x.kind === "connected" && x.verified_at)
      ? "CONNECTED"
      : rows.some((x) => x.kind === "evidence") ? "EVIDENCE" : "SELF";

export default async function Profile() {
  const { supabase, userId } = await requireUser();
  const [{ data: p }, { data: goals }, { data: proofs }, { data: dir }, { data: collab }, { data: records }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("goals").select("*").eq("owner_id", userId).order("created_at", { ascending: false }),
    supabase.from("proofs").select("*,proof_provenance(*)").eq("owner_id", userId).order("happened_at", { ascending: false }),
    supabase.from("direction_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("collaboration_proofs").select("*,teams(name)").eq("contributor_id", userId).order("created_at", { ascending: false }),
    supabase.from("records").select("id,body,domain,type,occurred_at").eq("author_id", userId).order("occurred_at", { ascending: false }).limit(12),
    supabase.from("team_members").select("team_id,role,status,joined_at,teams(name,domain,mission)").eq("user_id", userId).eq("status", "active"),
  ]);

  const displayName = p.display_name || "당신의 삶";
  const initials = String(displayName).slice(0, 1);
  const proofCount = proofs?.length ?? 0;
  const goalCount = goals?.filter((g: any) => g.status === "active").length ?? 0;
  const teamCount = memberships?.length ?? 0;
  const verifiedCount = proofs?.filter((x: any) => level(x.proof_provenance) !== "SELF").length ?? 0;

  return (
    <>
      <header className="profile-v2-head">
        <div className="profile-v2-main">
          <div className="profile-avatar-xl">{initials}</div>
          <div className="profile-identity">
            <div className="profile-name-line"><h1>{displayName}</h1><Link href="/settings" className="profile-edit">프로필 편집</Link></div>
            <div className="profile-handle">@{p.handle || "gieoi"}</div>
            <p>{p.headline || "말하지 않아도, 살아온 것이 당신을 보여줍니다."}</p>
            <div className="badges profile-domains">{(p.domains || []).map((d: string) => <span className="badge" key={d}>{d.toUpperCase()}</span>)}</div>
          </div>
        </div>

        <div className="profile-metrics">
          <div><strong>{proofCount}</strong><span>Proof</span></div>
          <div><strong>{goalCount}</strong><span>Active Goals</span></div>
          <div><strong>{teamCount}</strong><span>TEAM</span></div>
          <div><strong>{verifiedCount}</strong><span>Verified</span></div>
        </div>

        <div className="profile-toolbar"><GoalForm userId={userId} /><DirectionEditor userId={userId} initial={dir} /></div>
      </header>

      <nav className="profile-tabs" aria-label="프로필 섹션"><span className="active">TRAJECTORY</span><span>JOURNEY</span><span>PROOF</span><span>TEAM</span><span>ABOUT</span></nav>

      <section className="trajectory-panel">
        <div className="section-title-row"><div><span>CURRENT DIRECTION</span><h2>{dir?.stage || "지금의 방향을 설정해보세요."}</h2></div><small>현재 → 미래</small></div>
        <div className="direction-tags">{dir?.future_tags?.length ? dir.future_tags.map((x: string) => <span key={x}>{x}</span>) : <span>아직 Future tag가 없습니다.</span>}</div>
      </section>

      <section className="discover-section profile-section">
        <div className="section-title-row"><div><span>TRAJECTORY</span><h2>최근의 궤적</h2></div><small>{records?.length ?? 0} recent records</small></div>
        {records?.length ? <div className="trajectory-list">{records.map((r: any, i: number) => (
          <article className="trajectory-event" key={r.id}>
            <div className="trajectory-marker"><i className={r.type === "proof" ? "proof" : ""} /><span /></div>
            <div className="trajectory-content"><div className="trajectory-meta">{String(r.type).toUpperCase()} · {String(r.domain).toUpperCase()} · {new Date(r.occurred_at).toLocaleDateString("ko-KR")}</div><p>{r.body}</p></div>
          </article>
        ))}</div> : <div className="compact-empty">기록을 남기면 여기에 시간순으로 궤적이 생깁니다.</div>}
      </section>

      <section className="discover-section profile-section">
        <div className="section-title-row"><div><span>GOALS</span><h2>지금 향하는 곳</h2></div><small>{goalCount} active</small></div>
        {goals?.length ? <div className="profile-goal-grid">{goals.map((g: any) => (
          <article className="profile-goal" key={g.id}><div className="mini-label">{String(g.domain).toUpperCase()}</div><h3>{g.title}</h3><p>{g.why}</p><div className="goal-foot"><span>{g.current_stage || g.status}</span>{g.target_date && <span>{new Date(g.target_date).toLocaleDateString("ko-KR")}</span>}</div></article>
        ))}</div> : <div className="compact-empty">첫 Goal을 만들면 Journey와 Proof가 한 방향으로 연결됩니다.</div>}
      </section>

      <section className="discover-section profile-section">
        <div className="section-title-row"><div><span>PROOF VAULT</span><h2>말이 아니라, 근거가 남는다</h2></div><small>{proofCount} total</small></div>
        {proofs?.length ? <div className="discovery-stack">{proofs.map((x: any) => (
          <article className="evidence-row profile-proof" key={x.id}><div><span className="mini-label">{String(x.domain).toUpperCase()} · {new Date(x.happened_at).toLocaleDateString("ko-KR")}</span><h3>{x.title}</h3><p>{x.description}</p></div><span className="proof-level">{level(x.proof_provenance)}</span></article>
        ))}</div> : <div className="compact-empty">PROOF 타입으로 기록하면 Proof Vault에 자동으로 쌓입니다.</div>}
      </section>

      {memberships?.length ? <section className="discover-section profile-section"><div className="section-title-row"><div><span>TEAM</span><h2>함께 만들고 있는 것</h2></div></div><div className="team-discovery-list">{memberships.map((m: any) => <article className="discover-row" key={m.team_id}><div className="discover-symbol">T</div><div className="grow"><div className="row-title"><b>{m.teams?.name}</b><span>{String(m.teams?.domain || "TEAM").toUpperCase()}</span></div><p>{m.teams?.mission}</p><div className="meta">{m.role || "Member"}</div></div></article>)}</div></section> : null}

      {collab?.length ? <section className="discover-section profile-section"><div className="section-title-row"><div><span>COLLABORATION</span><h2>누구와 무엇을 만들었는가</h2></div></div><div className="discovery-stack">{collab.map((c: any) => <article className="evidence-row" key={c.id}><div><h3>{c.title}</h3><p>{c.teams?.name} · {c.contribution_type}</p></div></article>)}</div></section> : null}
    </>
  );
}
