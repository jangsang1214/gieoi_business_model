import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { OpportunityOutcomeForm } from "@/components/opportunity-outcome-form";
import { StartDmButton } from "@/components/start-dm-button";

const labels: Record<string, string> = {
  pending: "검토 대기",
  accepted: "수락",
  rejected: "거절",
  withdrawn: "지원 철회",
};

export default async function MyOpportunityApplications() {
  const { supabase, userId } = await requireUser();
  const { data: applications, error } = await supabase
    .from("opportunity_applications")
    .select("id,opportunity_id,status,created_at,opportunities(id,title,organization_name,status,created_by)")
    .eq("applicant_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  const accepted = (applications ?? []).filter((item) => item.status === "accepted");
  const applicationIds = accepted.map((item) => item.id);
  const ownerIds = [...new Set((applications ?? []).flatMap((item) => {
    const info = item.opportunities as unknown as { created_by?: string } | null;
    return info?.created_by ? [info.created_by] : [];
  }))];
  const [{ data: outcomes }, { data: myProofs }, { data: owners }] = await Promise.all([
    applicationIds.length
      ? supabase.from("opportunity_outcomes")
        .select("id,application_id,title,summary,status,proof_id")
        .in("application_id", applicationIds)
      : Promise.resolve({ data: [] as { id:string;application_id:string;title:string;summary:string;status:string;proof_id:string|null }[] }),
    supabase.from("proofs").select("id,title").eq("owner_id",userId).eq("visibility","public")
      .order("happened_at", { ascending:false }).limit(40),
    ownerIds.length
      ? supabase.from("profiles").select("id,discoverable").in("id",ownerIds)
      : Promise.resolve({ data: [] as { id:string; discoverable:boolean }[] }),
  ]);
  const outcomesByApplication = new Map((outcomes ?? []).map(item=>[item.application_id,item]));
  const ownerMap = new Map((owners ?? []).map(item=>[item.id,item]));

  return <>
    <header className="utility-head">
      <div><Link href="/opportunity" className="meta">← 기회</Link>
        <h1>내 지원 현황</h1><p>보낸 지원서와 검토 결과를 확인합니다.</p>
      </div>
    </header>
    {error && <p className="error notice" role="alert">지원 현황을 불러오지 못했습니다.</p>}
    {!error && !(applications ?? []).length && <div className="empty">
      <h3>아직 지원한 기회가 없습니다.</h3>
      <p>참여하고 싶은 기회를 찾아 첫 지원서를 남겨보세요.</p>
      <Link href="/opportunity" className="inline-action">기회 탐색 →</Link>
    </div>}
    <section className="match-list" aria-label="내 지원 목록">
      {(applications ?? []).map((app) => {
        const opportunity = app.opportunities as unknown as {
          id: string; title: string; organization_name: string; status: string; created_by: string;
        } | null;
        return <article className="match-card" key={app.id}>
          <div className="match-card-top"><div className="grow">
            <div className="mini-label">{new Date(app.created_at).toLocaleDateString("ko-KR")}</div>
            <h2>{opportunity?.title || "현재 열람할 수 없는 기회"}</h2>
            {opportunity?.organization_name && <p>{opportunity.organization_name}</p>}
          </div>
            <span className="stage-pill">{labels[app.status] ?? app.status}</span>
          </div>
          {opportunity?.status === "open" && <Link href={`/opportunity/${app.opportunity_id}`} className="inline-action">기회 상세 →</Link>}
          {app.status === "accepted" && <div className="opportunity-accepted-next">
            <p className="meta">지원이 수락됐습니다. 상대방과 직접 대화해 다음 활동을 정하세요.</p>
            {opportunity?.created_by && ownerMap.get(opportunity.created_by)?.discoverable && <StartDmButton me={userId} target={opportunity.created_by}/>}
            <OpportunityOutcomeForm userId={userId} applicationId={app.id}
              proofs={myProofs ?? []} outcome={outcomesByApplication.get(app.id) ?? null}/>
          </div>}
        </article>;
      })}
    </section>
  </>;
}
