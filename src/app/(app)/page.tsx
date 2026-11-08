import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { FeedPrompt } from "@/components/feed-prompt";
import { RecordMedia } from "@/components/record-media";
import { GettingStarted } from "@/components/getting-started";
import { ProfileAvatar } from "@/components/profile-avatar";

const domains = ["business", "workout", "create", "study", "career", "lifestyle"] as const;

export default async function Home({ searchParams }: { searchParams: Promise<{ domain?: string; feed?: string }> }) {
  const { supabase, userId } = await requireUser();
  const params = await searchParams;
  const selectedDomain = domains.includes(params.domain as (typeof domains)[number]) ? params.domain : null;
  const followingOnly = params.feed === "following";

  const [{ data: me }, { data: myGoals }, { data: memberships }, { count: myRecordCount }, { data: following }] = await Promise.all([
    supabase.from("profiles").select("primary_domains").eq("id", userId).single(),
    supabase.from("goals").select("id,domain").eq("owner_id", userId).eq("status", "active"),
    supabase.from("team_members").select("team_id").eq("user_id", userId).eq("status", "active"),
    supabase.from("records").select("id",{head:true,count:"exact"}).eq("author_id",userId),
    supabase.from("follows").select("following_id").eq("follower_id",userId),
  ]);

  const followed = new Set<string>((following || []).map((f: any) => f.following_id));
  let recordsQuery = supabase
    .from("records")
    .select("id,body,media,visibility,domain,type,occurred_at,author_id,profiles!records_author_id_fkey(display_name,handle,avatar_url),goals(id,title,domain),teams(id,name)")
    .order("occurred_at", { ascending: false })
    .limit(selectedDomain ? 30 : 60);
  if (selectedDomain) recordsQuery = recordsQuery.eq("domain", selectedDomain);
  if (followingOnly && followed.size) recordsQuery = recordsQuery.in("author_id",[...followed]);
  const { data: records } = followingOnly && !followed.size ? {data: []} : await recordsQuery;

  const preferred = new Set<string>([...(me?.primary_domains || []), ...(myGoals || []).map((g: any) => g.domain)]);
  const myTeams = new Set<string>((memberships || []).map((m: any) => m.team_id));
  const ranked = selectedDomain || followingOnly ? (records || []) : [...(records || [])].sort((a: any, b: any) => {
    const score = (r: any) => {
      const ageHours = Math.max(0, (Date.now() - new Date(r.occurred_at).getTime()) / 36e5);
      const recency = Math.max(0, 42 - ageHours / 5);
      return recency
        + (followed.has(r.author_id) ? 36 : 0)
        + (preferred.has(r.domain) ? 22 : 0)
        + (r.goals?.id ? 10 : 0)
        + (r.teams?.id && myTeams.has(r.teams.id) ? 28 : 0)
        + (r.type === "proof" ? 8 : 0);
    };
    return score(b) - score(a);
  });
  const feed = ranked.slice(0, 30);

  return (
    <>
      <header className="utility-head feed-head">
        <div><h1>홈</h1><p>지금 움직이는 것들.</p></div>
        <span className="live-mark"><i /> LIVE</span>
      </header>

      <FeedPrompt />
      <GettingStarted hasDomain={Boolean(me?.primary_domains?.length)} hasGoal={Boolean(myGoals?.length)} hasRecord={Boolean(myRecordCount)} />

      <div className="tabs feed-tabs">
        <Link href="/" className={`pill ${!followingOnly && !selectedDomain ? "active" : ""}`}>추천</Link>
        <Link href="/?feed=following" className={`pill ${followingOnly ? "active" : ""}`}>팔로잉</Link>
        {domains.map((domain) => <Link key={domain} href={`/?domain=${domain}`} className={`pill ${selectedDomain === domain ? "active" : ""}`}>{domain.toUpperCase()}</Link>)}
      </div>

      {!feed.length ? (
        <div className="empty feed-empty">
          <h3>{followingOnly ? "팔로잉 피드가 조용해요." : "아직 피드가 조용합니다."}</h3>
          <p>{followingOnly ? "관심 있는 사람을 팔로우하면 기록을 이곳에서 볼 수 있어요." : "첫 기록을 남기거나 사람과 TEAM을 발견해보세요."}</p>
          <Link href="/explore" className="inline-action">탐색 →</Link>
        </div>
      ) : feed.map((r: any) => {
        const profileHref = r.author_id === userId ? "/profile" : `/profile/${r.author_id}`;
        return <article className="post social-post" key={r.id}>
          <div className="post-head">
            <Link href={profileHref} className="avatar-link"><ProfileAvatar userId={r.profiles?.avatar_url ? r.author_id : null} name={r.profiles?.display_name} version={r.profiles?.avatar_url}/></Link>
            <div className="grow">
              <div className="post-user-line"><Link href={profileHref}><b>{r.profiles?.display_name || r.profiles?.handle || "프로프 사용자"}</b></Link>{r.profiles?.handle && <span>@{r.profiles.handle}</span>}</div>
              <div className="meta">{new Date(r.occurred_at).toLocaleDateString("ko-KR")}</div>
            </div>
            <div className="type-tag">{String(r.domain).toUpperCase()}{r.type === "proof" && <span>PROOF</span>}</div>
          </div>
          <div className="post-copy">
            <p>{r.body}</p>
            <RecordMedia media={r.media} />
            <Link href={`/record/${r.id}`} className="post-comment-link">{r.visibility === "public" ? "댓글 · 기록 보기" : "기록 보기"} →</Link>
            {(r.goals?.title || r.teams?.name) && <div className="linked">
              {r.goals?.title && <span className="chip">Goal · {r.goals.title}</span>}
              {r.teams?.name && <Link href={`/team/${r.teams.id}`} className="chip chip-link">TEAM · {r.teams.name}</Link>}
            </div>}
          </div>
        </article>;
      })}
    </>
  );
}
