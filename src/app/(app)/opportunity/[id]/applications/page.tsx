import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { OpportunityApplicationReview } from "@/components/opportunity-application-review";
import { OpportunityOutcomeReview } from "@/components/opportunity-outcome-review";
import { StartDmButton } from "@/components/start-dm-button";

const statusLabel: Record<string, string> = {
  pending: "검토 대기",
  accepted: "수락",
  rejected: "거절",
  withdrawn: "지원 철회",
};

export default async function OpportunityApplications({ params }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, userId } = await requireUser();
  const { data: opportunity } = await supabase.from("opportunities")
    .select("id,title,created_by")
    .eq("id", id)
    .maybeSingle();
  if (!opportunity || opportunity.created_by !== userId) notFound();

  const { data: applications, error } = await supabase
    .from("opportunity_applications")
    .select("id,applicant_id,proof_id,note,status,created_at,reviewed_at")
    .eq("opportunity_id", id)
    .order("created_at", { ascending: false })
    .limit(150);

  const applicationIds = (applications ?? []).filter(a=>a.status === "accepted").map(a=>a.id);
  const { data: outcomes } = applicationIds.length
    ? await supabase.from("opportunity_outcomes")
      .select("id,application_id,title,summary,status,proof_id")
      .in("application_id",applicationIds)
    : { data: [] as {id:string;application_id:string;title:string;summary:string;status:string;proof_id:string|null}[] };
  const outcomeMap = new Map((outcomes ?? []).map(item=>[item.application_id,item]));
  const applicantIds = [...new Set((applications ?? []).map((item) => item.applicant_id))];
  const proofIds = [...new Set([
    ...(applications ?? []).flatMap((item) => item.proof_id ? [item.proof_id] : []),
    ...(outcomes ?? []).flatMap((item) => item.proof_id ? [item.proof_id] : []),
  ])];
  const [{ data: profiles }, { data: proofs }] = await Promise.all([
    applicantIds.length
      ? supabase.from("profiles").select("id,display_name,handle,discoverable").in("id", applicantIds)
      : Promise.resolve({ data: [] as { id: string; display_name: string | null; handle: string | null; discoverable: boolean }[] }),
    proofIds.length
      ? supabase.from("proofs").select("id,title,owner_id,visibility").in("id", proofIds).eq("visibility", "public")
      : Promise.resolve({ data: [] as { id: string; title: string; owner_id: string; visibility: string }[] }),
  ]);
  const profileMap = new Map((profiles ?? []).map((person) => [person.id, person]));
  const proofMap = new Map((proofs ?? []).map((proof) => [proof.id, proof]));

  return <>
    <header className="utility-head">
      <div><Link href={`/opportunity/${id}`} className="meta">← 기회 상세</Link>
        <h1>지원자 관리</h1><p>{opportunity.title}</p>
      </div>
    </header>
    {error && <p className="error notice" role="alert">지원서를 불러오지 못했습니다.</p>}
    {!error && !(applications ?? []).length && <div className="empty">
      <h3>아직 지원자가 없습니다.</h3>
      <p>새 지원이 들어오면 이곳에서 확인하고 심사할 수 있어요.</p>
    </div>}
    <section className="opportunity-applicant-list" aria-label="지원자 목록">
      {(applications ?? []).map((app) => {
        const person = profileMap.get(app.applicant_id);
        const proof = app.proof_id ? proofMap.get(app.proof_id) : null;
        return <article className="match-card opportunity-applicant-card" key={app.id}>
          <div className="row opportunity-application-head">
            <div className="grow">
              <div className="mini-label">지원 · {new Date(app.created_at).toLocaleDateString("ko-KR")}</div>
              <h2>{person?.display_name || person?.handle || "지원자"}</h2>
            </div>
            <span className="stage-pill">{statusLabel[app.status] ?? app.status}</span>
          </div>
          <p className="match-mission opportunity-applicant-note">{app.note}</p>
          <div className="opportunity-applicant-links">
            {person?.discoverable && <Link href={`/profile/${app.applicant_id}`} className="inline-action">공개 프로필 →</Link>}
            {proof && proof.owner_id === app.applicant_id &&
              <Link href={`/proof/${proof.id}`} className="inline-action">첨부된 Proof · {proof.title} →</Link>}
          </div>
          {app.status === "pending" && <OpportunityApplicationReview applicationId={app.id}/>}
          {app.status === "accepted" && <>
            {person?.discoverable && <StartDmButton me={userId} target={app.applicant_id}/>}
            {outcomeMap.has(app.id) && (() => {
              const outcome = outcomeMap.get(app.id)!;
              const outcomeProof = outcome.proof_id ? proofMap.get(outcome.proof_id) : null;
              return <section className="opportunity-outcome-box" aria-label="협업 결과 확인">
                <div className="mini-label">COLLABORATION OUTCOME</div>
                <h3>{outcome.title}</h3><p>{outcome.summary}</p>
                {outcomeProof && outcomeProof.owner_id === app.applicant_id &&
                  <Link href={`/proof/${outcomeProof.id}`} className="inline-action">연결된 공개 Proof →</Link>}
                <div className="meta">{outcome.status === "confirmed" ? "상호 확인됨"
                  : outcome.status === "declined" ? "확인 거절됨" : "확인 요청 도착"}</div>
                {outcome.status === "pending" && <OpportunityOutcomeReview outcomeId={outcome.id}/>}
              </section>;
            })()}
          </>}
        </article>;
      })}
    </section>
  </>;
}
