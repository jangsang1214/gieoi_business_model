import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { StartDmButton } from "@/components/start-dm-button";

export default async function Messages() {
  const { supabase, userId } = await requireUser();
  const [{ data: convs }, { data: people }] = await Promise.all([
    supabase.from("conversations").select("id,kind,title,created_at,participant_ids,team_id,teams(name),messages(body,created_at,sender_id)").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id,display_name,headline").neq("id", userId).eq("discoverable", true).limit(12),
  ]);

  return (
    <>
      <section className="page-hero">
        <div className="eyebrow">MESSAGES</div>
        <h1>대화는 연결이<br />시작되는 곳.</h1>
        <p>DM, TEAM 제안, 지원, Opportunity와 Scout가 하나의 Inbox로 모입니다.</p>
      </section>
      <div className="tabs"><span className="pill active">전체</span><span className="pill">TEAM</span><span className="pill">요청</span></div>

      {convs?.length ? convs.map((c: any) => {
        const msgs = [...(c.messages || [])].sort((a: any, b: any) => +new Date(a.created_at) - +new Date(b.created_at));
        const last = msgs.at(-1);
        return (
          <Link className="conv" href={`/messages/${c.id}`} key={c.id}>
            <div className="avatar">{c.kind === "team" ? "T" : "D"}</div>
            <div className="grow"><b>{c.teams?.name || c.title || (c.kind === "dm" ? "Direct Message" : String(c.kind).toUpperCase())}</b><p>{last?.body || "대화를 시작해보세요."}</p></div>
            <div className="meta">{new Date(last?.created_at || c.created_at).toLocaleDateString("ko-KR")}</div>
          </Link>
        );
      }) : <div className="empty"><h3>아직 대화가 없습니다.</h3><p>아래에서 사람을 발견하고 첫 DM을 보내보세요.</p></div>}

      <section className="section"><div className="kicker">PEOPLE</div><h1 style={{ fontSize: 28 }}>살아온 방식으로<br />사람을 발견합니다.</h1></section>
      {people?.map((p: any) => (
        <div className="card" key={p.id}>
          <div className="row"><div className="avatar">{String(p.display_name || "?").slice(0, 1)}</div><div className="grow"><b>{p.display_name || "기어이 사용자"}</b><div className="meta">{p.headline || "Life Trajectory"}</div></div><StartDmButton me={userId} target={p.id} /></div>
        </div>
      ))}
    </>
  );
}
