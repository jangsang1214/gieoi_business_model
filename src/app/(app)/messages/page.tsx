import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { StartDmButton } from "@/components/start-dm-button";

export default async function Messages({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { supabase, userId } = await requireUser();
  const params = await searchParams;
  const tab = ["team", "request"].includes(String(params.tab)) ? String(params.tab) : "all";

  let convQuery = supabase
    .from("conversations")
    .select("id,kind,title,created_at,participant_ids,team_id,teams(name),messages(body,created_at,sender_id)")
    .order("created_at", { ascending: false });
  if (tab === "team") convQuery = convQuery.eq("kind", "team");
  if (tab === "request") convQuery = convQuery.in("kind", ["request", "scout"]);

  const [{ data: convs }, { data: people }] = await Promise.all([
    convQuery,
    supabase.from("profiles").select("id,display_name,headline").neq("id", userId).eq("discoverable", true).limit(8),
  ]);

  return (
    <>
      <header className="utility-head"><div><h1>메시지</h1><p>대화와 제안.</p></div></header>
      <div className="tabs inbox-tabs">
        <Link href="/messages" className={`pill ${tab === "all" ? "active" : ""}`}>전체</Link>
        <Link href="/messages?tab=team" className={`pill ${tab === "team" ? "active" : ""}`}>TEAM</Link>
        <Link href="/messages?tab=request" className={`pill ${tab === "request" ? "active" : ""}`}>요청</Link>
      </div>

      {convs?.length ? convs.map((c: any) => {
        const msgs = [...(c.messages || [])].sort((a: any, b: any) => +new Date(a.created_at) - +new Date(b.created_at));
        const last = msgs.at(-1);
        const mark = c.kind === "team" ? "T" : c.kind === "request" ? "↗" : c.kind === "scout" ? "S" : "D";
        return (
          <Link className="conv" href={`/messages/${c.id}`} key={c.id}>
            <div className="avatar">{mark}</div>
            <div className="grow"><b>{c.teams?.name || c.title || (c.kind === "dm" ? "Direct Message" : String(c.kind).toUpperCase())}</b><p>{last?.body || "대화를 시작해보세요."}</p></div>
            <div className="meta">{new Date(last?.created_at || c.created_at).toLocaleDateString("ko-KR")}</div>
          </Link>
        );
      }) : <div className="empty"><h3>아직 대화가 없습니다.</h3><p>사람을 발견하고 첫 대화를 시작해보세요.</p></div>}

      <section className="discover-section inbox-people">
        <div className="section-title-row"><div><span>PEOPLE</span><h2>사람</h2></div><Link href="/explore" className="quiet-link">더 보기</Link></div>
        {people?.length ? <div className="people-grid">{people.map((p: any) => (
          <article className="person-card" key={p.id}><Link href={`/profile/${p.id}`} className="person-card-link"><div className="person-top"><div className="avatar large">{String(p.display_name || "?").slice(0, 1)}</div><div className="grow"><h3>{p.display_name || "기어이 사용자"}</h3><div className="meta">{p.headline || ""}</div></div></div></Link><div className="person-action"><StartDmButton me={userId} target={p.id} /></div></article>
        ))}</div> : null}
      </section>
    </>
  );
}
