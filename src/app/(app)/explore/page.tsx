import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { RecordMedia } from "@/components/record-media";
import { DiscoveryTracker } from "@/components/activity-tracker";

const domains = ["business", "workout", "create", "study", "career", "lifestyle"];
const kinds = ["record", "proof", "goal", "team"] as const;

type Kind = (typeof kinds)[number];

type DiscoveryItem = {
  id: string;
  kind: Kind;
  domain: string;
  date: string;
  title?: string | null;
  body?: string | null;
  href: string;
  authorId?: string | null;
  authorName?: string | null;
  authorHandle?: string | null;
  meta?: string | null;
  media?: unknown;
};

function exploreHref({ q, domain, kind }: { q?: string; domain?: string; kind?: string }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (domain) params.set("domain", domain);
  if (kind) params.set("kind", kind);
  const suffix = params.toString();
  return suffix ? `/explore?${suffix}` : "/explore";
}

function excerpt(value: string | null | undefined, max = 150) {
  const text = String(value || "").trim();
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string; domain?: string; kind?: string }> }) {
  const { supabase, userId } = await requireUser();
  const params = await searchParams;
  const q = String(params.q || "").trim();
  const domain = domains.includes(String(params.domain || "").toLowerCase()) ? String(params.domain).toLowerCase() : "";
  const kind = kinds.includes(String(params.kind || "").toLowerCase() as Kind) ? String(params.kind).toLowerCase() as Kind : "";
  const pattern = `%${q.replace(/[%_,()]/g, "")}%`;

  let recordsQuery = supabase
    .from("records")
    .select("id,body,media,domain,type,occurred_at,author_id,profiles!records_author_id_fkey(display_name,handle)")
    .eq("visibility", "public")
    .neq("author_id", userId)
    .neq("type", "proof")
    .order("occurred_at", { ascending: false })
    .limit(80);

  let proofsQuery = supabase
    .from("proofs")
    .select("id,title,description,domain,happened_at,owner_id")
    .eq("visibility", "public")
    .neq("owner_id", userId)
    .order("happened_at", { ascending: false })
    .limit(40);

  let goalsQuery = supabase
    .from("goals")
    .select("id,title,why,domain,current_stage,created_at,owner_id,status")
    .eq("visibility", "public")
    .neq("owner_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(40);

  let teamsQuery = supabase
    .from("teams")
    .select("id,name,mission,domain,current_stage,created_at,owner_id,team_members(count),team_roles(title,is_open)")
    .eq("discoverable", true)
    .neq("owner_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (domain) {
    recordsQuery = recordsQuery.eq("domain", domain);
    proofsQuery = proofsQuery.eq("domain", domain);
    goalsQuery = goalsQuery.eq("domain", domain);
    teamsQuery = teamsQuery.eq("domain", domain);
  }
  if (q) {
    recordsQuery = recordsQuery.ilike("body", pattern);
    proofsQuery = proofsQuery.or(`title.ilike.${pattern},description.ilike.${pattern}`);
    goalsQuery = goalsQuery.or(`title.ilike.${pattern},why.ilike.${pattern}`);
    teamsQuery = teamsQuery.or(`name.ilike.${pattern},mission.ilike.${pattern}`);
  }

  const [recordsResult, proofsResult, goalsResult, teamsResult] = await Promise.all([
    kind && kind !== "record" ? Promise.resolve({ data: [] as any[] }) : recordsQuery,
    kind && kind !== "proof" ? Promise.resolve({ data: [] as any[] }) : proofsQuery,
    kind && kind !== "goal" ? Promise.resolve({ data: [] as any[] }) : goalsQuery,
    kind && kind !== "team" ? Promise.resolve({ data: [] as any[] }) : teamsQuery,
  ]);

  const records = recordsResult.data || [];
  const proofs = proofsResult.data || [];
  const goals = goalsResult.data || [];
  const teams = teamsResult.data || [];

  const ownerIds = [...new Set([...proofs.map((x: any) => x.owner_id), ...goals.map((x: any) => x.owner_id)].filter(Boolean))];
  const { data: owners } = ownerIds.length
    ? await supabase.from("profiles").select("id,display_name,handle").in("id", ownerIds)
    : { data: [] as any[] };
  const ownerMap = new Map((owners || []).map((x: any) => [x.id, x]));

  const items: DiscoveryItem[] = [
    ...records.map((r: any) => ({
      id: r.id,
      kind: "record" as const,
      domain: r.domain,
      date: r.occurred_at,
      body: r.body,
      media: r.media,
      href: `/profile/${r.author_id}`,
      authorId: r.author_id,
      authorName: r.profiles?.display_name || r.profiles?.handle || "기어이 사용자",
      authorHandle: r.profiles?.handle || null,
      meta: "기록",
    })),
    ...proofs.map((p: any) => {
      const owner = ownerMap.get(p.owner_id) as any;
      return {
        id: p.id,
        kind: "proof" as const,
        domain: p.domain,
        date: p.happened_at,
        title: p.title,
        body: p.description,
        href: `/proof/${p.id}`,
        authorId: p.owner_id,
        authorName: owner?.display_name || owner?.handle || "기어이 사용자",
        authorHandle: owner?.handle || null,
        meta: "Proof",
      };
    }),
    ...goals.map((g: any) => {
      const owner = ownerMap.get(g.owner_id) as any;
      return {
        id: g.id,
        kind: "goal" as const,
        domain: g.domain,
        date: g.created_at,
        title: g.title,
        body: g.why,
        href: `/goal/${g.id}`,
        authorId: g.owner_id,
        authorName: owner?.display_name || owner?.handle || "기어이 사용자",
        authorHandle: owner?.handle || null,
        meta: g.current_stage || "Goal",
      };
    }),
    ...teams.map((t: any) => {
      const openRoles = (t.team_roles || []).filter((r: any) => r.is_open).map((r: any) => r.title).slice(0, 2);
      const memberCount = t.team_members?.[0]?.count ?? 0;
      return {
        id: t.id,
        kind: "team" as const,
        domain: t.domain,
        date: t.created_at,
        title: t.name,
        body: t.mission,
        href: `/team/${t.id}`,
        meta: openRoles.length ? `${openRoles.join(" · ")} 모집` : `${memberCount}명 · ${t.current_stage || "진행 중"}`,
      };
    }),
  ].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return <>
    <header className="utility-head explore-head-v8">
      <div><h1>탐색</h1><p>지금 사람들이 무엇을 살아내고 있는지 훑어봅니다.</p></div>
    </header>

    <form className="explore-search explore-search-v8" action="/explore" method="get">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.2 4.2"/></svg>
      <input name="q" defaultValue={q} placeholder="기록, Goal, Proof, TEAM 검색" aria-label="기어이 탐색 검색" />
      {domain && <input type="hidden" name="domain" value={domain} />}
      {kind && <input type="hidden" name="kind" value={kind} />}
      {(q || domain || kind) && <Link href="/explore" className="search-clear">초기화</Link>}
    </form>

    <div className="explore-filter-stack">
      <nav className="explore-domain-tabs" aria-label="분야 필터">
        <Link className={!domain ? "active" : ""} href={exploreHref({ q, kind })}>전체</Link>
        {domains.map((d) => <Link className={domain === d ? "active" : ""} key={d} href={exploreHref({ q, domain: d, kind })}>{d.toUpperCase()}</Link>)}
      </nav>
      <nav className="explore-kind-tabs" aria-label="콘텐츠 유형 필터">
        <Link className={!kind ? "active" : ""} href={exploreHref({ q, domain })}>모두</Link>
        <Link className={kind === "record" ? "active" : ""} href={exploreHref({ q, domain, kind: "record" })}>기록</Link>
        <Link className={kind === "proof" ? "active" : ""} href={exploreHref({ q, domain, kind: "proof" })}>Proof</Link>
        <Link className={kind === "goal" ? "active" : ""} href={exploreHref({ q, domain, kind: "goal" })}>Goal</Link>
        <Link className={kind === "team" ? "active" : ""} href={exploreHref({ q, domain, kind: "team" })}>TEAM</Link>
      </nav>
    </div>

    <DiscoveryTracker userId={userId}/>
    {items.length ? <div className="discovery-grid-v8">{items.map((item, index) => {
      const isFeatured = item.kind === "proof" || (item.kind === "record" && String(item.body || "").length > 120);
      const isWide = item.kind === "team" || (item.kind === "goal" && index % 5 === 0);
      const cardClass = ["discovery-tile-v8", `tile-${item.kind}`, isFeatured ? "tile-featured" : "", isWide ? "tile-wide" : "", Array.isArray(item.media) && item.media.length ? "tile-has-media" : ""].filter(Boolean).join(" ");

      return <article className={cardClass} key={`${item.kind}-${item.id}`} data-discovery-id={item.id} data-discovery-kind={item.kind}>
        <Link href={item.href} className="discovery-tile-link">
          <div className="tile-topline">
            <span className="tile-kind">{item.kind === "record" ? "RECORD" : item.kind.toUpperCase()}</span>
            <span>{String(item.domain).toUpperCase()}</span>
          </div>

          <RecordMedia media={item.media} variant="grid" />
          <div className="tile-main">
            {item.title && <h2>{item.title}</h2>}
            <p>{excerpt(item.body, isFeatured ? 220 : 135)}</p>
          </div>

          <div className="tile-bottom">
            {item.authorId ? <span className="tile-author"><i>{String(item.authorName || "?").slice(0, 1)}</i><span><b>{item.authorName}</b>{item.authorHandle && <small>@{item.authorHandle}</small>}</span></span> : <span className="tile-author"><i>T</i><span><b>{item.title}</b><small>TEAM</small></span></span>}
            <span className="tile-meta">{item.meta}</span>
          </div>
        </Link>
      </article>;
    })}</div> : <div className="empty discovery-empty-v8"><h3>아직 발견할 것이 없습니다.</h3><p>필터를 바꾸거나 검색어를 지워보세요.</p></div>}
  </>;
}
