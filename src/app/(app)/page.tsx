import { requireUser } from "@/lib/auth";
import { FeedPrompt } from "@/components/feed-prompt";

export default async function Home() {
  const { supabase } = await requireUser();
  const { data: records } = await supabase
    .from("records")
    .select("id,body,domain,type,occurred_at,author_id,profiles!records_author_id_fkey(display_name,handle),goals(title),teams(name)")
    .order("occurred_at", { ascending: false })
    .limit(30);

  return (
    <>
      <header className="utility-head feed-head">
        <div><h1>홈</h1><p>실제로 움직이는 사람들의 오늘.</p></div>
        <span className="live-mark"><i /> LIVE TRAJECTORY</span>
      </header>

      <FeedPrompt />

      <div className="tabs feed-tabs">
        <span className="pill active">For You</span>
        <span className="pill">BUSINESS</span>
        <span className="pill">WORKOUT</span>
        <span className="pill">CREATE</span>
        <span className="pill">STUDY</span>
        <span className="pill">CAREER</span>
        <span className="pill">LIFESTYLE</span>
      </div>

      {!records?.length ? (
        <div className="empty feed-empty">
          <h3>아직 피드가 조용합니다.</h3>
          <p>첫 기록을 남기거나 탐색에서 실제로 움직이는 사람과 TEAM을 발견해보세요.</p>
          <a href="/explore" className="inline-action">탐색으로 이동 →</a>
        </div>
      ) : records.map((r: any) => (
        <article className="post social-post" key={r.id}>
          <div className="post-head">
            <div className="avatar">{String(r.profiles?.display_name || "나").slice(0, 1)}</div>
            <div className="grow">
              <div className="post-user-line"><b>{r.profiles?.display_name || r.profiles?.handle || "기어이 사용자"}</b>{r.profiles?.handle && <span>@{r.profiles.handle}</span>}</div>
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
          <div className="post-actions social-actions">
            <button aria-label="존중">♡ <span>존중</span></button>
            <button aria-label="댓글">○ <span>댓글</span></button>
            <button aria-label="공유">↗ <span>공유</span></button>
          </div>
        </article>
      ))}
    </>
  );
}
