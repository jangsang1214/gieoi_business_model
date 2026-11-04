import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { RecordMedia } from "@/components/record-media";
import { ActivityViewTracker } from "@/components/activity-tracker";

export default async function RecordDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, userId } = await requireUser();
  const { data: record } = await supabase.from("records").select("id,author_id,body,media,type,domain,occurred_at,goal_id,team_id").eq("id",id).maybeSingle();
  if (!record) notFound();
  const [{ data: author }, { data: goal }, { data: team }, { data: proof }] = await Promise.all([
    supabase.from("profiles").select("id,display_name,handle").eq("id",record.author_id).maybeSingle(),
    record.goal_id ? supabase.from("goals").select("id,title").eq("id",record.goal_id).maybeSingle() : Promise.resolve({data:null as {id:string;title:string}|null}),
    record.team_id ? supabase.from("teams").select("id,name").eq("id",record.team_id).maybeSingle() : Promise.resolve({data:null as {id:string;name:string}|null}),
    supabase.from("proofs").select("id,title").eq("record_id",id).limit(1).maybeSingle(),
  ]);
  const profileHref = record.author_id === userId ? "/profile" : `/profile/${record.author_id}`;
  return <>
    <ActivityViewTracker userId={userId} type="record_open" id={id} source="record_detail"/>
    <header className="utility-head"><div><Link href="/explore" className="meta">← 탐색</Link><h1>기록</h1></div></header>
    <article className="record-detail-v9">
      <div className="record-detail-author">
        <Link href={profileHref} className="avatar">{String(author?.display_name || "?").slice(0,1)}</Link>
        <div><Link href={profileHref}><b>{author?.display_name || "기어이 사용자"}</b></Link>
        <div className="meta">{new Date(record.occurred_at).toLocaleDateString("ko-KR")} · {String(record.domain).toUpperCase()}</div></div>
        {record.type === "proof" && <span className="proof-level">PROOF</span>}
      </div>
      {record.body && <p className="record-detail-body">{record.body}</p>}
      <RecordMedia media={record.media}/>
      <div className="explore-context-links">
        {goal && <Link href={`/goal/${goal.id}`} className="chip">Goal · {goal.title}</Link>}
        {team && <Link href={`/team/${team.id}`} className="chip">TEAM · {team.name}</Link>}
        {proof && <Link href={`/proof/${proof.id}`} className="chip">Proof · {proof.title}</Link>}
      </div>
    </article>
  </>;
}
