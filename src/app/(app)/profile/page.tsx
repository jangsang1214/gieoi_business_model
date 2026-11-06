import Link from "next/link";
import { RecordMedia } from "@/components/record-media";
import { requireUser } from "@/lib/auth";
import { GoalForm } from "@/components/goal-form";
import { DirectionEditor } from "@/components/direction-editor";
import { ProfileTabs } from "@/components/profile-tabs";

const level = (rows: any[] = []) =>
  rows.some(x=>x.kind==="organization_verified"&&x.verified_at) ? "ORG VERIFIED"
  : rows.some(x=>x.kind==="team_confirmed"&&x.verified_at) ? "TEAM CONFIRMED"
  : rows.some(x=>x.kind==="connected"&&x.verified_at) ? "CONNECTED"
  : rows.some(x=>x.kind==="evidence") ? "EVIDENCE" : "SELF";
const openLabel=(x:string)=>({team:"TEAM",job:"Job",collaboration:"Collaboration",project:"Project",
  competition:"Competition",research:"Research",investment:"Investment"} as Record<string,string>)[x]||x;

export default async function Profile() {
  const {supabase,userId}=await requireUser();
  const [{data:p},{data:goals},{data:proofs},{data:dir},{data:collab},{data:records},{data:memberships}]=await Promise.all([
    supabase.from("profiles").select("*").eq("id",userId).single(),
    supabase.from("goals").select("*").eq("owner_id",userId).order("created_at",{ascending:false}),
    supabase.from("proofs").select("*,proof_provenance(*)").eq("owner_id",userId).order("happened_at",{ascending:false}),
    supabase.from("direction_profiles").select("*").eq("user_id",userId).maybeSingle(),
    supabase.from("collaboration_proofs").select("*,teams(name)").eq("contributor_id",userId).order("created_at",{ascending:false}),
    supabase.from("records").select("id,body,media,domain,type,occurred_at").eq("author_id",userId).order("occurred_at",{ascending:false}).limit(30),
    supabase.from("team_members").select("team_id,role_name,status,joined_at,teams(name,domain,mission)").eq("user_id",userId).eq("status","active"),
  ]);
  if(!p) return <div className="empty"><h3>프로필을 불러오지 못했습니다.</h3></div>;
  const displayName=p.display_name||"당신의 삶";
  const goalCount=(goals||[]).filter((g:any)=>g.status==="active").length;
  const verifiedCount=(proofs||[]).filter((x:any)=>(x.proof_provenance||[]).some((pr:any)=>
    ["connected","team_confirmed","organization_verified"].includes(pr.kind)&&Boolean(pr.verified_at))).length;
  const affiliation=p.affiliation_visible&&p.affiliation_name?
    [p.affiliation_name,p.affiliation_role].filter(Boolean).join(" · "):null;

  const sections=[
    {id:"record",label:"기록",content:<section className="discover-section profile-section">
      <div className="section-title-row"><div><span>TRAJECTORY</span><h2>지금까지의 기록</h2></div></div>
      {records?.length ? <div className="profile-record-grid-v16">{records.map((r:any)=><Link href={`/record/${r.id}`}
        className={`profile-record-card-v16 ${Array.isArray(r.media)&&r.media.length?"has-media":""}`} key={r.id}>
        <span className="mini-label">{r.type==="proof"?"PROOF":"RECORD"} · {String(r.domain).toUpperCase()}</span>
        <RecordMedia media={r.media} variant="grid"/>
        <div className="profile-record-copy-v16"><p>{r.body||"사진 기록"}</p><small>{new Date(r.occurred_at).toLocaleDateString("ko-KR")}</small></div>
      </Link>)}</div> : <div className="compact-empty">첫 기록을 남기면 이곳에 쌓여요.</div>}
    </section>},
    {id:"goal",label:"Goal",content:<section className="discover-section profile-section">
      <div className="section-title-row"><div><span>GOAL</span><h2>앞으로 이루려는 것</h2></div></div>
      {goals?.length ? <div className="profile-goal-grid">{goals.map((g:any)=><Link href={`/goal/${g.id}`} className="profile-goal" key={g.id}>
        <div className="mini-label">{String(g.domain).toUpperCase()}</div><h3>{g.title}</h3>{g.why&&<p>{g.why}</p>}
        <div className="goal-foot"><span>{g.current_stage||g.status}</span>{g.target_date&&<span>{new Date(g.target_date).toLocaleDateString("ko-KR")}</span>}</div>
      </Link>)}</div> : <div className="compact-empty">이루고 싶은 것을 Goal로 남겨보세요.</div>}
    </section>},
    {id:"proof",label:"Proof",content:<section className="discover-section profile-section">
      <div className="section-title-row"><div><span>PROOF</span><h2>남긴 결과</h2></div></div>
      {proofs?.length ? <div className="discovery-stack">{proofs.map((x:any)=><Link href={`/proof/${x.id}`} className="evidence-row profile-proof" key={x.id}>
        <div><span className="mini-label">{String(x.domain).toUpperCase()} · {new Date(x.happened_at).toLocaleDateString("ko-KR")}</span><h3>{x.title}</h3><p>{x.description}</p></div>
        <span className="proof-level">{level(x.proof_provenance)}</span>
      </Link>)}</div> : <div className="compact-empty">해낸 결과가 생기면 Proof로 남겨보세요.</div>}
    </section>},
    {id:"team",label:"TEAM",content:<section className="discover-section profile-section">
      <div className="section-title-row"><div><span>TEAM</span><h2>함께하고 있는 것</h2></div></div>
      {memberships?.length ? <div className="team-discovery-list">{memberships.map((m:any)=><Link href={`/team/${m.team_id}`} className="discover-row" key={m.team_id}>
        <div className="discover-symbol">T</div><div className="grow"><div className="row-title"><b>{m.teams?.name}</b><span>{String(m.teams?.domain||"").toUpperCase()}</span></div>
        <p>{m.teams?.mission}</p><div className="meta">{m.role_name||"Member"}</div></div>
      </Link>)}</div> : <div className="compact-empty">아직 참여한 TEAM이 없습니다.</div>}
      {collab?.length ? <div className="discovery-stack profile-collab-v16">{collab.map((c:any)=><article className="evidence-row" key={c.id}>
        <div><h3>{c.title}</h3><p>{c.teams?.name} · {c.contribution_type}</p></div>
      </article>)}</div> : null}
    </section>},
  ];

  return <>
    <header className="profile-v2-head">
      <div className="profile-v2-main">
        <div className="profile-avatar-xl">{String(displayName).slice(0,1)}</div>
        <div className="profile-identity">
          <div className="profile-name-line"><h1>{displayName}</h1><Link href="/settings" className="profile-edit">프로필 편집</Link></div>
          <div className="profile-handle">@{p.handle||"gieoi"}</div>
          {affiliation&&<div className="profile-affiliation">{affiliation}</div>}
          <p>{p.headline||"지금 하고 있는 일을 한 줄로 소개해 보세요."}</p>
          <div className="badges profile-domains">{(p.primary_domains||[]).slice(0,3).map((d:string)=><span className="badge" key={d}>{d.toUpperCase()}</span>)}</div>
          {(p.open_to||[]).length>0&&<div className="open-to-line"><span>Open to</span>{p.open_to.slice(0,4).map((x:string)=><b key={x}>{openLabel(x)}</b>)}</div>}
        </div>
      </div>
      <div className="profile-metrics">
        <div><strong>{goalCount}</strong><span>Goals</span></div>
        <div><strong>{proofs?.length||0}</strong><span>Proof</span></div>
        <div><strong>{memberships?.length||0}</strong><span>TEAM</span></div>
        <div><strong>{verifiedCount}</strong><span>Verified</span></div>
      </div>
      <div className="profile-toolbar"><GoalForm userId={userId}/><DirectionEditor userId={userId} initial={dir}/></div>
    </header>
    <section className="trajectory-panel">
      <div className="section-title-row"><div><span>CURRENT</span><h2>{dir?.stage||"지금의 방향"}</h2></div></div>
      <div className="direction-tags">{dir?.future_tags?.length ? dir.future_tags.slice(0,5).map((x:string)=><span key={x}>{x}</span>) : <span>방향을 추가해보세요.</span>}</div>
    </section>
    <ProfileTabs sections={sections}/>
  </>;
}
