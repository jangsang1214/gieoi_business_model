import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { OpportunityInquiryButton } from "@/components/opportunity-inquiry-button";
import { RecommendationActions } from "@/components/recommendation-actions";
import { opportunityDomainLabel, opportunityKindLabel, opportunityReasons } from "@/lib/opportunity";

export default async function OpportunityDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, userId } = await requireUser();
  const { data: opportunity } = await supabase.from("opportunities")
    .select("*")
    .eq("id", id)
    .eq("status", "open")
    .maybeSingle();
  if (!opportunity) notFound();

  const [{ data: owner }, { data: direction }, { data: feedback }] = await Promise.all([
    supabase.from("profiles").select("id,display_name,handle,discoverable").eq("id", opportunity.created_by).maybeSingle(),
    supabase.from("direction_profiles").select("future_tags,skill_tags,preferred_domains").eq("user_id", userId).maybeSingle(),
    supabase.from("recommendation_feedback").select("state").eq("user_id", userId)
      .eq("target_type", "opportunity").eq("target_id", id).maybeSingle(),
  ]);
  const reasons = opportunityReasons(direction, opportunity);
  const isOwner = opportunity.created_by === userId;
  const canContact = !isOwner && owner?.discoverable === true;

  return <>
    <header className="utility-head">
      <div><Link href="/opportunity" className="meta">← 기회</Link>
        <div className="mini-label">{opportunityKindLabel(opportunity.kind)} · {opportunityDomainLabel(opportunity.domain)}</div>
        <h1>{opportunity.title}</h1>
        <p>{opportunity.organization_name}</p>
      </div>
    </header>
    <article className="opportunity-detail-v16">
      <div className="opportunity-detail-meta-v16">
        <span>{new Date(opportunity.created_at).toLocaleDateString("ko-KR")}</span>
        {opportunity.verified_organization && <span>인증된 기관</span>}
        {opportunity.desired_stage && <span>진행 단계 · {opportunity.desired_stage}</span>}
      </div>

      {reasons.length > 0 && <section className="opportunity-detail-match" aria-label="기회 추천 이유">
        <h2>왜 나에게 추천했을까요?</h2>
        <ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        <p className="meta">현재 프로필에 등록된 정보 기준이며, 자격이나 선발을 보장하지 않습니다.</p>
      </section>}

      <h2>기회 소개</h2>
      <p className="opportunity-description-v16">{opportunity.description || "아직 상세 소개가 없습니다."}</p>

      {(opportunity.required_skills?.length ?? 0) > 0 && <div className="opportunity-skill-list-v16">
        <h3>필요한 역량</h3>
        <div className="badges">{opportunity.required_skills.map((skill: string) =>
          <span className="badge" key={skill}>{skill}</span>
        )}</div>
      </div>}
      {(opportunity.desired_future_tags?.length ?? 0) > 0 && <div className="opportunity-skill-list-v16">
        <h3>지향하는 방향</h3>
        <div className="badges">{opportunity.desired_future_tags.map((tag: string) =>
          <span className="badge" key={tag}>{tag}</span>
        )}</div>
      </div>}

      <div className="opportunity-detail-actions-v16">
        {canContact && <OpportunityInquiryButton userId={userId} ownerId={opportunity.created_by}
          opportunityId={id} opportunityTitle={opportunity.title}/>}
        {owner?.discoverable && <Link className="btn secondary"
          href={isOwner ? "/profile" : `/profile/${owner.id}`}>등록자 프로필</Link>}
        <RecommendationActions userId={userId} targetType="opportunity" targetId={id}
          initialState={(feedback?.state as "saved" | "dismissed" | undefined) ?? null}/>
      </div>
      {isOwner && <p className="meta">내가 등록한 기회입니다.</p>}
      {!isOwner && !canContact && <p className="meta">현재 등록자에게 직접 메시지를 보낼 수 없습니다.</p>}
      <p className="meta">게시된 내용은 등록자가 작성한 정보입니다. 기관 인증 표시가 없으면 공식 인증이 확인되지 않았습니다.</p>
      <Link href="/opportunity" className="inline-action">다른 기회 보기 →</Link>
    </article>
  </>;
}
