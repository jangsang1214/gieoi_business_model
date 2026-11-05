import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { RecordMedia } from "@/components/record-media";
import { ActivityViewTracker } from "@/components/activity-tracker";
import { RecordComments } from "@/components/record-comments";
import { RecordOwnerActions } from "@/components/record-owner-actions";
import { RecordDeleteButton } from "@/components/record-delete-button";

export default async function RecordDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, userId } = await requireUser();
  const { data: record } = await supabase.from("records").select("id,author_id,body,media,type,domain,occurred_at,goal_id,team_id,visibility").eq("id",id).maybeSingle();
  if (!record) notFound();
  const [{ data: author }, { data: goal }, { data: team }, { data: proof }] = await Promise.all([
    supabase.from("profiles").select("id,display_name,handle").eq("id",record.author_id).maybeSingle(),
    record.goal_id ? supabase.from("goals").select("id,title").eq("id",record.goal_id).maybeSingle() : Promise.resolve({data:null as {id:string;title:string}|null}),
    record.team_id ? supabase.from("teams").select("id,name").eq("id",record.team_id).maybeSingle() : Promise.resolve({data:null as {id:string;name:string}|null}),
    supabase.from("proofs").select("id,title").eq("record_id",id).limit(1).maybeSingle(),
  ]);
  const profileHref = record.author_id === userId ? "/profile" : `/profile/${record.author_id}`;
  const { data: comments } = record.visibility === "public"
    ? await supabase.from("record_comments").select("id,author_id,body,created_at").eq("record_id",id).order("created_at",{ascending:true}).limit(100)
    : { data: [] as { id: string; author_id: string; body: string; created_at: string }[] };
  const authorIds = [...new Set((comments || []).map((comment) => comment.author_id))];
  const { data: commentAuthors } = authorIds.length
    ? await supabase.from("profiles").select("id,display_name,handle").in("id",authorIds)
    : { data: [] as { id: string; display_name: string | null; handle: string | null }[] };
  const authorMap = new Map((commentAuthors || []).map((person) => [person.id, person]));
  const initialComments = (comments || []).map((comment) => ({ ...comment,
    authorName: authorMap.get(comment.author_id)?.display_name || "기어이 사용자",
    authorHandle: authorMap.get(comment.author_id)?.handle || null,
  }));
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
      {record.author_id === userId && <div className="record-owner-actions">
        <RecordOwnerActions recordId={record.id} authorId={userId} initialBody={record.body}
          initialVisibility={record.visibility} hasTeam={Boolean(record.team_id)}/>
        <RecordDeleteButton id={record.id} authorId={userId} media={record.media}/>
      </div>}
      <div className="explore-context-links">
        {goal && <Link href={`/goal/${goal.id}`} className="chip">Goal · {goal.title}</Link>}
        {team && <Link href={`/team/${team.id}`} className="chip">TEAM · {team.name}</Link>}
        {proof && <Link href={`/proof/${proof.id}`} className="chip">Proof · {proof.title}</Link>}
      </div>
    </article>
    {record.visibility === "public" && <RecordComments recordId={id} userId={userId} recordOwnerId={record.author_id} initial={initialComments}/>} 
  </>;
}
