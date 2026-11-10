import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "@/lib/i18n-server";
import { messagesFor } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import { OpportunityInquiryButton } from "@/components/opportunity-inquiry-button";
import { OpportunityApplicationForm } from "@/components/opportunity-application-form";
import { RecommendationActions } from "@/components/recommendation-actions";
import { opportunityDomainLabel, opportunityKindLabel, opportunityReasons } from "@/lib/opportunity";

export default async function OpportunityDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, userId } = await requireUser();
  const locale = await getLocale();
  const t = messagesFor(locale).opportunity;
  const { data: opportunity } = await supabase.from("opportunities")
    .select("*")
    .eq("id", id)
    .eq("status", "open")
    .maybeSingle();
  if (!opportunity) notFound();

  const [{ data: owner }, { data: direction }, { data: ownProfile }, { data: feedback }, { data: application }, { data: myProofs }] = await Promise.all([
    supabase.from("profiles").select("id,display_name,handle,discoverable").eq("id", opportunity.created_by).maybeSingle(),
    supabase.from("direction_profiles").select("future_tags,skill_tags,preferred_domains").eq("user_id", userId).maybeSingle(),
    supabase.from("profiles").select("primary_domains").eq("id", userId).maybeSingle(),
    supabase.from("recommendation_feedback").select("state").eq("user_id", userId)
      .eq("target_type", "opportunity").eq("target_id", id).maybeSingle(),
    supabase.from("opportunity_applications").select("id,status")
      .eq("opportunity_id", id).eq("applicant_id", userId).maybeSingle(),
    supabase.from("proofs").select("id,title").eq("owner_id", userId)
      .eq("visibility", "public").order("happened_at", { ascending: false }).limit(40),
  ]);
  const signals = { ...(direction ?? {}), preferred_domains: [...new Set([
    ...(direction?.preferred_domains ?? []), ...(ownProfile?.primary_domains ?? []),
  ])] };
  const reasons = opportunityReasons(signals, opportunity, locale);
  const isOwner = opportunity.created_by === userId;
  const canContact = !isOwner && owner?.discoverable === true;

  return <>
    <header className="utility-head">
      <div><Link href="/opportunity" className="meta">← {t.back}</Link>
        <div className="mini-label">{opportunityKindLabel(opportunity.kind, locale)} · {opportunityDomainLabel(opportunity.domain, locale)}</div>
        <h1>{opportunity.title}</h1>
        <p>{opportunity.organization_name}</p>
      </div>
    </header>
    <article className="opportunity-detail-v16">
      <div className="opportunity-detail-meta-v16">
        <span>{new Date(opportunity.created_at).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US")}</span>
        {opportunity.verified_organization && <span>{t.verified}</span>}
        {opportunity.desired_stage && <span>{t.stage} · {opportunity.desired_stage}</span>}
      </div>

      {reasons.length > 0 && <section className="opportunity-detail-match" aria-label={t.reason}>
        <h2>{t.why}</h2>
        <ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        <p className="meta">{t.reasonDisclaimer}</p>
      </section>}

      <h2>{t.description}</h2>
      <p className="opportunity-description-v16">{opportunity.description || t.noDescription}</p>

      {(opportunity.required_skills?.length ?? 0) > 0 && <div className="opportunity-skill-list-v16">
        <h3>{t.skills}</h3>
        <div className="badges">{opportunity.required_skills.map((skill: string) =>
          <span className="badge" key={skill}>{skill}</span>
        )}</div>
      </div>}
      {(opportunity.desired_future_tags?.length ?? 0) > 0 && <div className="opportunity-skill-list-v16">
        <h3>{t.direction}</h3>
        <div className="badges">{opportunity.desired_future_tags.map((tag: string) =>
          <span className="badge" key={tag}>{tag}</span>
        )}</div>
      </div>}

      <div className="opportunity-detail-actions-v16">
        {!isOwner && <OpportunityApplicationForm userId={userId} opportunityId={id}
          application={application as { id: string; status: "pending" | "accepted" | "rejected" | "withdrawn" } | null}
          proofs={myProofs ?? []} locale={locale}/>}
        {isOwner && <Link className="btn primary" href={`/opportunity/${id}/applications`}>{t.manage}</Link>}
        {canContact && <OpportunityInquiryButton userId={userId} ownerId={opportunity.created_by}
          opportunityId={id} opportunityTitle={opportunity.title} locale={locale}/>}
        {owner?.discoverable && <Link className="btn secondary"
          href={isOwner ? "/profile" : `/profile/${owner.id}`}>{t.owner}</Link>}
        <RecommendationActions userId={userId} targetType="opportunity" targetId={id}
          initialState={(feedback?.state as "saved" | "dismissed" | undefined) ?? null}/>
      </div>
      {isOwner && <p className="meta">{t.ownListing}</p>}
      {!isOwner && !canContact && <p className="meta">{t.contactUnavailable}</p>}
      <p className="meta">{t.sourceDisclaimer}</p>
      <div className="opportunity-detail-footer-links">
        <Link href="/opportunity/applications" className="inline-action">{t.applications} →</Link>
        <Link href="/opportunity" className="inline-action">{t.other} →</Link>
      </div>
    </article>
  </>;
}
