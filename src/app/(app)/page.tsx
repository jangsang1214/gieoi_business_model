import { requireUser } from "@/lib/auth";

export default async function Home() {
  const { supabase } = await requireUser();
  const { data: records } = await supabase
    .from("records")
    .select("id,body,domain,type,occurred_at,author_id,profiles!records_author_id_fkey(display_name,handle),goals(title),teams(name)")
    .order("occurred_at", { ascending: false })
    .limit(30);

  return (
    <>
      <section className="page-hero">
        <div className="eyebrow">FOR YOU</div>
        <h1>살아가는 사람들의<br />지금.</h1>
        <p>완성된 결과보다, 그곳까지 가는 사람들의 오늘을 봅니다.</p>
      </section>

      <div className="tabs">
        <span className="pill active">For You</span>
        <span className="pill">BUSINESS</span>
        <span className="pill">WORKOUT</span>
        <span className="pill">CREATE</span>
        <span className="pill">STUDY</span>
        <span className="pill">CAREER</span>
        <span className="pill">LIFESTYLE</span>
      </div>

      {!records?.length ? (
        <div className="empty">
          <h3>첫 장면을 남겨보세요.</h3>
          <p>오른쪽 아래 + 버튼에서 LIFE, JOURNEY, PROOF를 기록하면 당신의 Trajectory가 시작됩니다.</p>
        </div>
      ) : records.map((r: any) => (
        <article className="post" key={r.id}>
          <div className="post-head">
            <div className="avatar">{String(r.profiles?.display_name || "나").slice(0, 1)}</div>
            <div className="grow">
              <b>{r.profiles?.display_name || r.profiles?.handle || "기어이 사용자"}</b>
              <div className="meta">{new Date(r.occurred_at).toLocaleDateString("ko-KR")}</div>
            </div>
            <div className="type-tag">{String(r.domain).toUpperCase()}<span>{String(r.type).toUpperCase()}</span></div>
          </div>
          <div className="post-copy">
            <p>{r.body}</p>
            <div className="linked">
              {r.goals?.title && <span className="chip">Goal · {r.goals.title}</span>}
              {r.teams?.name && <span className="chip">TEAM · {r.teams.name}</span>}
            </div>
          </div>
          <div className="post-actions"><button>존중</button><button>응원</button><button>함께하기</button></div>
        </article>
      ))}
    </>
  );
}
