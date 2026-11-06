import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { StartDmButton } from "@/components/start-dm-button";
import { TeamProposalButton } from "@/components/team-proposal-button";
import { RecordMedia } from "@/components/record-media";
import { ActivityViewTracker } from "@/components/activity-tracker";
import { FollowButton } from "@/components/follow-button";
import { BlockUserButton } from "@/components/block-user-button";
import { ReportButton } from "@/components/report-button";

export default async function PublicProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, userId } = await requireUser();
  if (id === userId) redirect("/profile");

  const [{ data: profile }, { data: goals }, { data: proofs }, { data: records }, { data: memberships }, { data: myMemberships }, { data: existingFollow }] = await Promise.all([
    supabase.from("profiles").select("id,display_name,handle,headline,bio,primary_domains,open_to,discoverable,affiliation_name,affiliation_role,affiliation_visible").eq("id", id).maybeSingle(),
    supabase.from("goals").select("id,title,why,domain,target_date,status").eq("owner_id", id).eq("visibility", "public").order("created_at", { ascending: false }).limit(8),
    supabase.from("proofs").select("id,title,description,domain,happened_at").eq("owner_id", id).eq("visibility", "public").order("happened_at", { ascending: false }).limit(12),
    supabase.from("records").select("id,body,media,type,domain,occurred_at").eq("author_id", id).eq("visibility", "public").order("occurred_at", { ascending: false }).limit(12),
    supabase.from("team_members").select("team_id,role_name,status,teams(id,name,domain,mission)").eq("user_id", id).eq("status", "active"),
    supabase.from("team_members").select("teams(id,name)").eq("user_id", userId).eq("status", "active"),
    supabase.from("follows").select("following_id").eq("follower_id", userId).eq("following_id",id).maybeSingle(),
  ]);

  if (!profile || !profile.discoverable) notFound();
  const teams = (myMemberships || []).map((m: any) => m.teams).filter(Boolean);

  return <>
    <ActivityViewTracker userId={userId} type="profile_view" id={id}/>
    <header className="profile-v2-head">
      <div className="profile-v2-main">
        <div className="profile-avatar-xl">{String(profile.display_name || "?").slice(0,1)}</div>
        <div className="profile-identity">
          <div className="profile-name-line"><h1>{profile.display_name}</h1></div>
          <div className="profile-handle">@{profile.handle || "gieoi"}</div>
          {profile.affiliation_visible && profile.affiliation_name && <div className="profile-affiliation"><b>{profile.affiliation_name}</b>{profile.affiliation_role && <span> · {profile.affiliation_role}</span>}</div>}
          <p>{profile.headline || profile.bio}</p>
          <div className="badges profile-domains">{(profile.primary_domains || []).slice(0,4).map((d:string)=><span className="badge" key={d}>{d.toUpperCase()}</span>)}</div>
          {(profile.open_to || []).length > 0 && <div className="open-to-line"><span>Open to</span>{profile.open_to.slice(0,4).map((x:string)=><b key={x}>{x}</b>)}</div>}
          <div className="public-profile-actions"><FollowButton me={userId} target={id} initiallyFollowing={Boolean(existingFollow)} /><StartDmButton me={userId} target={id} /><TeamProposalButton me={userId} target={id} teams={teams} /><BlockUserButton userId={userId} targetId={id} /><ReportButton userId={userId} targetType="user" targetId={id} /></div>
        </div>
      </div>
    </header>

    <section className="discover-section"><div className="section-title-row"><div><span>GOALS</span><h2>향하고 있는 것</h2></div></div>{goals?.length ? <div className="profile-goal-grid">{goals.map((g:any)=><article className="profile-goal" key={g.id}><div className="mini-label">{String(g.domain).toUpperCase()}</div><h3>{g.title}</h3><p>{g.why}</p>{g.target_date&&<div className="goal-foot"><span>{g.status}</span><span>{new Date(g.target_date).toLocaleDateString("ko-KR")}</span></div>}</article>)}</div>:<div className="compact-empty">공개 Goal이 없습니다.</div>}</section>

    <section className="discover-section"><div className="section-title-row"><div><span>PROOF</span><h2>증명한 것</h2></div></div>{proofs?.length ? <div className="discovery-stack">{proofs.map((p:any)=><article className="evidence-row" key={p.id}><div><div className="mini-label">{String(p.domain).toUpperCase()}</div><h3>{p.title}</h3><p>{p.description}</p></div><span className="stage-pill">{new Date(p.happened_at).toLocaleDateString("ko-KR")}</span></article>)}</div>:<div className="compact-empty">공개 Proof가 없습니다.</div>}</section>

    <section className="discover-section"><div className="section-title-row"><div><span>TEAM</span><h2>함께하고 있는 것</h2></div></div>{memberships?.length ? <div className="team-discovery-list">{memberships.map((m:any)=><Link href={`/team/${m.team_id}`} className="discover-row" key={m.team_id}><div className="discover-symbol">T</div><div className="grow"><div className="row-title"><b>{m.teams?.name}</b><span>{String(m.teams?.domain||"").toUpperCase()}</span></div><p>{m.teams?.mission}</p><div className="meta">{m.role_name}</div></div></Link>)}</div>:<div className="compact-empty">공개 TEAM 활동이 없습니다.</div>}</section>

    <section className="discover-section"><div className="section-title-row"><div><span>TRAJECTORY</span><h2>최근의 기록</h2></div></div>{records?.length ? <div className="trajectory-list">{records.map((r:any)=><article className="trajectory-event" key={r.id}><div className="trajectory-marker"><i className={r.type==="proof"?"proof":""}/><span/></div><div className="trajectory-content"><div className="trajectory-meta">{String(r.type).toUpperCase()} · {String(r.domain).toUpperCase()} · {new Date(r.occurred_at).toLocaleDateString("ko-KR")}</div><p>{r.body}</p><RecordMedia media={r.media} variant="profile" /></div></article>)}</div>:<div className="compact-empty">공개 기록이 없습니다.</div>}</section>
  </>;
}
