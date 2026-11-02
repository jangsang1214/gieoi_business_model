import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { TeamApplyButton } from "@/components/team-apply-button";
import { TeamGoalForm } from "@/components/team-goal-form";
import { TeamRoleCreator } from "@/components/team-role-creator";
import { TeamApplicationReview } from "@/components/team-application-review";
import { ComposeLinkButton } from "@/components/compose-link-button";

export default async function TeamDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, userId } = await requireUser();

  const { data: team } = await supabase.from("teams").select("*").eq("id", id).maybeSingle();
  if (!team) notFound();

  const isOwner = team.owner_id === userId;
  const [{ data: roles }, { data: members }, { data: goals }, { data: records }, { data: proofs }, { data: applications }] = await Promise.all([
    supabase.from("team_roles").select("*").eq("team_id", id).order("created_at"),
    supabase.from("team_members").select("team_id,user_id,role_name,status,joined_at").eq("team_id", id).eq("status", "active"),
    supabase.from("goals").select("*").eq("team_id", id).order("created_at", { ascending: false }),
    supabase.from("records").select("id,body,type,domain,occurred_at,author_id,goal_id").eq("team_id", id).order("occurred_at", { ascending: false }).limit(30),
    supabase.from("proofs").select("id,title,description,domain,happened_at,owner_id,goal_id").eq("team_id", id).order("happened_at", { ascending: false }).limit(20),
    isOwner ? supabase.from("team_applications").select("id,applicant_id,role_id,status,created_at").eq("team_id", id).order("created_at", { ascending: false }) : Promise.resolve({ data: [] as any[] }),
  ]);

  const profileIds = [...new Set([...(members || []).map((m: any) => m.user_id), ...(applications || []).map((a: any) => a.applicant_id)])];
  const { data: profiles } = profileIds.length
    ? await supabase.from("profiles").select("id,display_name,handle,headline,affiliation_name,affiliation_role").in("id", profileIds)
    : { data: [] as any[] };
  const pmap = new Map((profiles || []).map((p: any) => [p.id, p]));
  const roleMap = new Map((roles || []).map((r: any) => [r.id, r]));

  return <>
    <header className="utility-head team-detail-head">
      <div>
        <Link href="/team" className="meta">← TEAM</Link>
        <h1>{team.name}</h1>
        <p>{team.mission}</p>
      </div>
      <div className="badges"><span className="badge">{String(team.domain).toUpperCase()}</span>{team.current_stage && <span className="badge">{team.current_stage}</span>}</div>
    </header>

    <section className="discover-section">
      <div className="section-title-row"><div><span>NOW</span><h2>지금 함께 해내는 것</h2></div>{isOwner && <div className="row"><TeamGoalForm teamId={id} userId={userId} domain={team.domain} /><TeamRoleCreator teamId={id} /></div>}</div>
      {goals?.length ? <div className="profile-goal-grid">{goals.map((g: any) => <article className="profile-goal" key={g.id}><div className="mini-label">GOAL</div><h3>{g.title}</h3><p>{g.why}</p><div className="goal-inline-actions"><ComposeLinkButton goalId={g.id} teamId={id} label="기록" /><ComposeLinkButton goalId={g.id} teamId={id} proof label="Proof" /></div>{g.target_date && <div className="goal-foot"><span>목표일</span><span>{new Date(g.target_date).toLocaleDateString("ko-KR")}</span></div>}</article>)}</div> : <div className="compact-empty">아직 TEAM Goal이 없습니다.</div>}
    </section>

    <section className="discover-section">
      <div className="section-title-row"><div><span>ROLES</span><h2>함께할 사람</h2></div></div>
      {roles?.length ? <div className="discovery-stack">{roles.map((r: any) => <article className="evidence-row" key={r.id}><div><h3>{r.title}</h3><p>{r.description}</p><div className="badges">{(r.required_skills || []).slice(0,4).map((s:string)=><span className="badge" key={s}>{s}</span>)}</div></div><div>{r.is_open ? (isOwner ? <span className="stage-pill">모집 중</span> : <TeamApplyButton teamId={id} userId={userId} roleId={r.id} label="지원" />) : <span className="stage-pill">마감</span>}</div></article>)}</div> : <div className="compact-empty">열린 역할이 없습니다.</div>}
    </section>

    <section className="discover-section">
      <div className="section-title-row"><div><span>PEOPLE</span><h2>{members?.length || 0}명이 함께하고 있습니다</h2></div></div>
      <div className="people-grid">{(members || []).map((m: any) => { const p = pmap.get(m.user_id); return <Link href={`/profile/${m.user_id}`} className="person-card" key={m.user_id}><div className="person-top"><div className="avatar large">{String(p?.display_name || "?").slice(0,1)}</div><div><h3>{p?.display_name || "기어이 사용자"}</h3><div className="meta">{m.role_name}</div></div></div>{p?.affiliation_name && <p>{p.affiliation_name}{p.affiliation_role ? ` · ${p.affiliation_role}` : ""}</p>}</Link>; })}</div>
    </section>

    <section className="discover-section">
      <div className="section-title-row"><div><span>TRAJECTORY</span><h2>TEAM의 궤적</h2></div><ComposeLinkButton teamId={id} label="기록 남기기" /></div>
      {records?.length ? <div className="trajectory-list">{records.map((r:any)=><article className="trajectory-event" key={r.id}><div className="trajectory-marker"><i className={r.type === "proof" ? "proof" : ""}/><span/></div><div className="trajectory-content"><div className="trajectory-meta">{String(r.type).toUpperCase()} · {new Date(r.occurred_at).toLocaleDateString("ko-KR")}</div><p>{r.body}</p></div></article>)}</div> : <div className="compact-empty">TEAM에 연결된 기록이 쌓이면 여기에 나타납니다.</div>}
    </section>

    <section className="discover-section">
      <div className="section-title-row"><div><span>PROOF</span><h2>함께 남긴 결과</h2></div><ComposeLinkButton teamId={id} proof label="Proof 남기기" /></div>
      {proofs?.length ? <div className="discovery-stack">{proofs.map((p:any)=><article className="evidence-row" key={p.id}><div><div className="mini-label">{String(p.domain).toUpperCase()}</div><h3>{p.title}</h3><p>{p.description}</p></div><span className="stage-pill">{new Date(p.happened_at).toLocaleDateString("ko-KR")}</span></article>)}</div> : <div className="compact-empty">아직 TEAM Proof가 없습니다.</div>}
    </section>

    {isOwner && applications?.length ? <section className="discover-section"><div className="section-title-row"><div><span>APPLICATIONS</span><h2>지원</h2></div></div><div className="discovery-stack">{applications.map((a:any)=>{const p=pmap.get(a.applicant_id);const role=roleMap.get(a.role_id);return <article className="evidence-row" key={a.id}><div><h3>{p?.display_name || "지원자"}</h3><p>{role?.title || "TEAM"} · {a.status}</p></div><div className="application-review-wrap"><Link className="btn secondary" href={`/profile/${a.applicant_id}`}>프로필</Link>{a.status === "pending" && <TeamApplicationReview applicationId={a.id} teamId={id} applicantId={a.applicant_id} roleName={role?.title || "Member"} />}</div></article>})}</div></section> : null}
  </>;
}
