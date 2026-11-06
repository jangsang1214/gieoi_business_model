import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { RecordMedia } from "@/components/record-media";
import { ActivityViewTracker } from "@/components/activity-tracker";
import { ReportButton } from "@/components/report-button";

export default async function ProofDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, userId } = await requireUser();
  const { data: proof } = await supabase.from("proofs").select("*").eq("id", id).maybeSingle();
  if (!proof) notFound();

  const [{ data: owner }, { data: goal }, { data: team }, { data: record }, { data: provenance }] = await Promise.all([
    supabase.from("profiles").select("id,display_name,handle,headline").eq("id", proof.owner_id).maybeSingle(),
    proof.goal_id ? supabase.from("goals").select("id,title,status").eq("id", proof.goal_id).maybeSingle() : Promise.resolve({ data: null as any }),
    proof.team_id ? supabase.from("teams").select("id,name,mission").eq("id", proof.team_id).maybeSingle() : Promise.resolve({ data: null as any }),
    proof.record_id ? supabase.from("records").select("id,body,media,occurred_at").eq("id", proof.record_id).maybeSingle() : Promise.resolve({ data: null as any }),
    supabase.from("proof_provenance").select("kind,evidence_url,verified_at").eq("proof_id", id),
  ]);

  const level = (provenance || []).some((x: any) => x.kind === "organization_verified" && x.verified_at)
    ? "VERIFIED"
    : (provenance || []).some((x: any) => x.kind === "team_confirmed" && x.verified_at)
      ? "TEAM"
      : (provenance || []).some((x: any) => x.kind === "connected" && x.verified_at)
        ? "CONNECTED"
        : (provenance || []).some((x: any) => x.kind === "evidence")
          ? "EVIDENCE"
          : "SELF";

  return <>
    <ActivityViewTracker userId={userId} type="proof_view" id={id}/>
    <header className="utility-head context-detail-head">
      <div>
        <Link href="/explore" className="meta">← 탐색</Link>
        <div className="mini-label">PROOF · {String(proof.domain).toUpperCase()}</div>
        <h1>{proof.title}</h1>
        <p>{proof.description}</p>
      </div>
      <div className="context-owner-block">
        <span className="proof-level">{level}</span>
        {proof.owner_id !== userId && <ReportButton userId={userId} targetType="proof" targetId={id}/>} 
        {owner && <Link href={`/profile/${owner.id}`} className="context-owner-link"><b>{owner.display_name}</b><span>@{owner.handle || "gieoi"}</span></Link>}
      </div>
    </header>

    <section className="proof-context-panel">
      <div><span>날짜</span><b>{new Date(proof.happened_at).toLocaleDateString("ko-KR")}</b></div>
      {goal && <Link href={`/goal/${goal.id}`}><span>Goal</span><b>{goal.title}</b></Link>}
      {team && <Link href={`/team/${team.id}`}><span>TEAM</span><b>{team.name}</b></Link>}
    </section>

    {record && <section className="discover-section"><div className="section-title-row"><div><span>RECORD</span><h2>이 결과가 남겨진 기록</h2></div></div><article className="explore-record-card proof-source-record"><p className="explore-record-body">{record.body}</p><RecordMedia media={record.media}/><div className="meta">{new Date(record.occurred_at).toLocaleDateString("ko-KR")}</div></article></section>}

    {(provenance || []).some((x: any) => x.evidence_url) && <section className="discover-section"><div className="section-title-row"><div><span>EVIDENCE</span><h2>연결된 근거</h2></div></div><div className="discovery-stack">{(provenance || []).filter((x: any) => x.evidence_url).map((x: any, index: number) => <a key={`${x.kind}-${index}`} className="evidence-row" href={x.evidence_url} target="_blank" rel="noreferrer"><div><div className="mini-label">{String(x.kind).toUpperCase()}</div><h3>외부 근거 보기</h3></div><span className="stage-pill">↗</span></a>)}</div></section>}
  </>;
}
