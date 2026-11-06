import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function OpportunityDetail({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const {supabase,userId}=await requireUser();
  const {data:opportunity}=await supabase.from("opportunities")
    .select("id,title,description,organization_name,kind,domain,created_at,created_by,status,required_skills,desired_stage,verified_organization")
    .eq("id",id).eq("status","open").maybeSingle();
  if(!opportunity) notFound();

  const {data:owner}=await supabase.from("profiles")
    .select("id,display_name,handle,discoverable").eq("id",opportunity.created_by).maybeSingle();

  return <>
    <header className="utility-head">
      <div><Link href="/opportunity" className="meta">← 기회</Link>
        <div className="mini-label">{String(opportunity.kind).toUpperCase()} · {String(opportunity.domain).toUpperCase()}</div>
        <h1>{opportunity.title}</h1>
        <p>{opportunity.organization_name}</p>
      </div>
    </header>
    <article className="opportunity-detail-v16">
      <div className="opportunity-detail-meta-v16">
        <span>{new Date(opportunity.created_at).toLocaleDateString("ko-KR")}</span>
        {opportunity.verified_organization&&<span>조직 인증</span>}
        {opportunity.desired_stage&&<span>{opportunity.desired_stage}</span>}
      </div>
      <h2>기회 소개</h2>
      <p className="opportunity-description-v16">{opportunity.description||"아직 상세 소개가 없습니다."}</p>
      {opportunity.required_skills?.length>0&&<div className="opportunity-skill-list-v16">
        <h3>관련 역량</h3>
        <div className="badges">{opportunity.required_skills.map((skill:string)=><span className="badge" key={skill}>{skill}</span>)}</div>
      </div>}
      <div className="opportunity-detail-actions-v16">
        {owner?.discoverable&&<Link className="btn primary" href={owner.id===userId?"/profile":`/profile/${owner.id}`}>등록자 프로필 보기</Link>}
        <Link className="btn secondary" href="/opportunity">다른 기회 보기</Link>
      </div>
    </article>
  </>;
}
