import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { OpportunityOutcomeForm } from "@/components/opportunity-outcome-form";
import { StartDmButton } from "@/components/start-dm-button";
import { getLocale } from "@/lib/i18n-server";
import { messagesFor } from "@/lib/i18n";

const labels: Record<string, string> = {
  pending: "검토 대기",
  accepted: "수락",
  rejected: "거절",
  withdrawn: "지원 철회",
};

export default async function MyOpportunityApplications({ searchParams }: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { supabase, userId } = await requireUser();
  const locale = await getLocale();
  const en = locale === "en";
  const t = messagesFor(locale).opportunity;
  const requested = Number((await searchParams).page ?? "1");
  const page = Number.isSafeInteger(requested) && requested >= 1 ? Math.min(requested, 10000) : 1;
  const pageSize = 50;
  const { data: applications, error, count } = await supabase
    .from("opportunity_applications")
    .select("id,opportunity_id,status,created_at,opportunities(id,title,organization_name,status,created_by)", { count: "exact" })
    .eq("applicant_id", userId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));

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
      <div><Link href="/opportunity" className="meta">← {t.title}</Link>
        <h1>{t.applications}</h1><p>{en ? "Track the status of your applications." : "보낸 지원서와 검토 결과를 확인합니다."}</p>
      </div>
    </header>
    {error && <p className="error notice" role="alert">{en ? "Could not load your applications." : "지원 현황을 불러오지 못했습니다."}</p>}
    {!error && (count ?? 0) === 0 && <div className="empty">
      <h3>{en ? "No applications yet." : "아직 지원한 기회가 없습니다."}</h3>
      <p>{en ? "Explore opportunities and send your first application." : "참여하고 싶은 기회를 찾아 첫 지원서를 남겨보세요."}</p>
      <Link href="/opportunity" className="inline-action">{en ? "Explore opportunities" : "기회 탐색"} →</Link>
    </div>}
    {!error && (count ?? 0) > 0 && !(applications ?? []).length && <div className="empty">
      <h3>{en ? "No applications on this page." : "이 페이지에는 지원 내역이 없습니다."}</h3>
      <Link href={`/opportunity/applications?page=${totalPages}`} className="inline-action">{en ? "Go to last page" : "마지막 페이지로 이동"} →</Link>
    </div>}
    <section className="match-list" aria-label={t.applications}>
      {(applications ?? []).map((app) => {
        const opportunity = app.opportunities as unknown as {
          id: string; title: string; organization_name: string; status: string; created_by: string;
        } | null;
        return <article className="match-card" key={app.id}>
          <div className="match-card-top"><div className="grow">
            <div className="mini-label">{new Date(app.created_at).toLocaleDateString(en ? "en-US" : "ko-KR")}</div>
            <h2>{opportunity?.title || (en ? "Opportunity unavailable" : "현재 열람할 수 없는 기회")}</h2>
            {opportunity?.organization_name && <p>{opportunity.organization_name}</p>}
          </div>
            <span className="stage-pill">{en ? ({pending:"Under review", accepted:"Accepted", rejected:"Not selected", withdrawn:"Withdrawn"} as Record<string,string>)[app.status] ?? app.status : (labels[app.status] ?? app.status)}</span>
          </div>
          {opportunity?.status === "open" && <Link href={`/opportunity/${app.opportunity_id}`} className="inline-action">{en ? "View opportunity" : "기회 상세"} →</Link>}
          {app.status === "accepted" && <div className="opportunity-accepted-next">
            <p className="meta">{en ? "Your application was accepted. Message the organizer to agree on next steps." : "지원이 수락됐습니다. 상대방과 직접 대화해 다음 활동을 정하세요."}</p>
            {opportunity?.created_by && ownerMap.get(opportunity.created_by)?.discoverable && <StartDmButton me={userId} target={opportunity.created_by} locale={locale}/>}
            <OpportunityOutcomeForm userId={userId} applicationId={app.id}
              proofs={myProofs ?? []} outcome={outcomesByApplication.get(app.id) ?? null} locale={locale}/>
          </div>}
        </article>;
      })}
    </section>
    {!error && (count ?? 0) > 0 && <nav className="opportunity-review-pagination" aria-label={en ? "My application pages" : "내 지원 페이지 이동"}>
      <span className="meta">{en ? "Total" : "총"} {count}{en ? " applications" : "건"} · {Math.min(page, totalPages)} / {totalPages}{en ? " pages" : "페이지"}</span>
      <div className="row">
        {page > 1 && <Link className="btn secondary" href={`/opportunity/applications?page=${page - 1}`}>{en ? "Previous" : "이전"}</Link>}
        {page < totalPages && <Link className="btn secondary" href={`/opportunity/applications?page=${page + 1}`}>{en ? "Next" : "다음"}</Link>}
      </div>
    </nav>}
  </>;
}
