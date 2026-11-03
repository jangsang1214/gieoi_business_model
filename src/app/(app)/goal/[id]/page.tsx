import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function GoalDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const { data: goal } = await supabase.from("goals").select("*").eq("id", id).maybeSingle();
  if (!goal) notFound();

  const [{ data: owner }, { data: records }, { data: proofs }, { data: team }] = await Promise.all([
    supabase.from("profiles").select("id,display_name,handle,headline").eq("id", goal.owner_id).maybeSingle(),
    supabase.from("records").select("id,body,type,domain,occurred_at,team_id").eq("goal_id", id).order("occurred_at", { ascending: false }).limit(30),
    supabase.from("proofs").select("id,title,description,domain,happened_at").eq("goal_id", id).order("happened_at", { ascending: false }).limit(20),
    goal.team_id ? supabase.from("teams").select("id,name,mission").eq("id", goal.team_id).maybeSingle() : Promise.resolve({ data: null as any }),
  ]);

  return <>
    <header className="utility-head context-detail-head">
      <div>
        <Link href="/explore" className="meta">← 탐색</Link>
        <div className="mini-label">GOAL · {String(goal.domain).toUpperCase()}</div>
        <h1>{goal.title}</h1>
        {goal.why && <p>{goal.why}</p>}
      </div>
      <div className="context-owner-block">
        {owner && <Link href={`/profile/${owner.id}`} className="context-owner-link"><b>{owner.display_name}</b><span>@{owner.handle || "gieoi"}</span></Link>}
        {team && <Link href={`/team/${team.id}`} className="chip">TEAM · {team.name}</Link>}
      </div>
    </header>

    <section className="discover-section">
      <div className="section-title-row"><div><span>TRAJECTORY</span><h2>이 Goal을 향한 기록</h2></div>{goal.target_date && <small>목표 {new Date(goal.target_date).toLocaleDateString("ko-KR")}</small>}</div>
      {records?.length ? <div className="trajectory-list">{records.map((r: any) => <article className="trajectory-event" key={r.id}><div className="trajectory-marker"><i className={r.type === "proof" ? "proof" : ""}/><span/></div><div className="trajectory-content"><div className="trajectory-meta">{r.type === "proof" ? "PROOF" : "기록"} · {new Date(r.occurred_at).toLocaleDateString("ko-KR")}</div><p>{r.body}</p></div></article>)}</div> : <div className="compact-empty">아직 공개된 기록이 없습니다.</div>}
    </section>

    <section className="discover-section">
      <div className="section-title-row"><div><span>PROOF</span><h2>이 Goal에서 남긴 결과</h2></div></div>
      {proofs?.length ? <div className="discovery-stack">{proofs.map((p: any) => <Link href={`/proof/${p.id}`} className="evidence-row" key={p.id}><div><div className="mini-label">{String(p.domain).toUpperCase()}</div><h3>{p.title}</h3><p>{p.description}</p></div><span className="stage-pill">{new Date(p.happened_at).toLocaleDateString("ko-KR")}</span></Link>)}</div> : <div className="compact-empty">아직 공개된 Proof가 없습니다.</div>}
    </section>
  </>;
}
