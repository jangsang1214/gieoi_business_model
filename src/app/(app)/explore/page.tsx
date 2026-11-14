import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { RecordMedia } from "@/components/record-media";
import { DiscoveryTracker } from "@/components/activity-tracker";
import { ExploreEmpty } from "@/components/explore-empty";
import { ProfileAvatar } from "@/components/profile-avatar";
import { getLocale } from "@/lib/i18n-server";
import { messagesFor } from "@/lib/i18n";

const domains = ["business","workout","create","study","career","lifestyle"] as const;
const kinds = ["record","proof","goal","team","person"] as const;
type Kind = (typeof kinds)[number];
type FilterParams = { q?: string; domain?: string; kind?: string; sort?: string; page?: string };
type DiscoveryItem = {
  id:string; kind:Kind; domain:string; date:string;
  title?:string|null; body?:string|null; media?:unknown;
  href:string; authorId?:string|null; authorName?:string|null; authorHandle?:string|null; authorAvatar?:string|null; meta?:string|null;
};
const sizes = { record:24, proof:12, goal:12, team:8, person:12 } as const;
const humanDomains: Record<string,string> = {
  business:"비즈니스",workout:"운동",create:"창작",study:"공부",career:"커리어",lifestyle:"라이프"
};

function exploreHref(filters: FilterParams) {
  const params = new URLSearchParams();
  if(filters.q) params.set("q",filters.q);
  if(filters.domain) params.set("domain",filters.domain);
  if(filters.kind) params.set("kind",filters.kind);
  if(filters.sort && filters.sort !== "relevant") params.set("sort",filters.sort);
  if(filters.page && filters.page !== "1") params.set("page",filters.page);
  const query=params.toString();
  return query ? `/explore?${query}` : "/explore";
}
function excerpt(value:string|null|undefined,max=160) {
  const t=String(value||"").trim();
  return t.length>max ? t.slice(0,max).trim()+"…" : t;
}
function safeText(q:string) {
  return q.trim().replace(/[%_,().\\]/g,"").slice(0,60);
}
function timeScore(date:string) {
  const hours=Math.max(0,(Date.now()-new Date(date).getTime())/36e5);
  return Math.max(0,28-hours/12);
}

export default async function ExplorePage({searchParams}:{searchParams:Promise<FilterParams>}) {
  const {supabase,userId}=await requireUser();
  const locale = await getLocale();
  const en = locale === "en";
  const t = messagesFor(locale);
  const params=await searchParams;
  const q=safeText(String(params.q||""));
  const domain=domains.includes(params.domain as typeof domains[number]) ? String(params.domain) : "";
  const kind=kinds.includes(params.kind as Kind) ? params.kind as Kind : "";
  const sort=params.sort==="recent" ? "recent" : "relevant";
  const page=Math.max(1,Math.min(50,Number.parseInt(params.page||"1",10)||1));
  const pattern=`%${q}%`;
  const recordLimit=sizes.record, proofLimit=sizes.proof, goalLimit=sizes.goal, teamLimit=sizes.team, personLimit=sizes.person;

  let recordsQuery=supabase.from("records")
    .select("id,body,media,domain,type,occurred_at,author_id,profiles!records_author_id_fkey(display_name,handle,avatar_url)")
    .eq("visibility","public").neq("author_id",userId).neq("type","proof")
    .order("occurred_at",{ascending:false}).range((page-1)*recordLimit,page*recordLimit);
  let proofsQuery=supabase.from("proofs")
    .select("id,title,description,domain,happened_at,owner_id")
    .eq("visibility","public").neq("owner_id",userId)
    .order("happened_at",{ascending:false}).range((page-1)*proofLimit,page*proofLimit);
  let goalsQuery=supabase.from("goals")
    .select("id,title,why,domain,current_stage,created_at,owner_id,status")
    .eq("visibility","public").neq("owner_id",userId).eq("status","active")
    .order("created_at",{ascending:false}).range((page-1)*goalLimit,page*goalLimit);
  let teamsQuery=supabase.from("teams")
    .select("id,name,mission,domain,current_stage,created_at,owner_id,team_members(count),team_roles(title,is_open)")
    .eq("discoverable",true).is("archived_at",null).neq("owner_id",userId)
    .order("created_at",{ascending:false}).range((page-1)*teamLimit,page*teamLimit);
  let peopleQuery=supabase.from("profiles")
    .select("id,display_name,handle,headline,bio,avatar_url,primary_domains,open_to,created_at")
    .eq("discoverable",true).neq("id",userId)
    .order("created_at",{ascending:false}).range((page-1)*personLimit,page*personLimit);

  if(domain) {
    recordsQuery=recordsQuery.eq("domain",domain);
    proofsQuery=proofsQuery.eq("domain",domain);
    goalsQuery=goalsQuery.eq("domain",domain);
    teamsQuery=teamsQuery.eq("domain",domain);
    peopleQuery=peopleQuery.contains("primary_domains",[domain]);
  }
  if(q) {
    recordsQuery=recordsQuery.ilike("body",pattern);
    proofsQuery=proofsQuery.or(`title.ilike.${pattern},description.ilike.${pattern}`);
    goalsQuery=goalsQuery.or(`title.ilike.${pattern},why.ilike.${pattern}`);
    teamsQuery=teamsQuery.or(`name.ilike.${pattern},mission.ilike.${pattern}`);
    peopleQuery=peopleQuery.or(`display_name.ilike.${pattern},handle.ilike.${pattern},headline.ilike.${pattern},bio.ilike.${pattern}`);
  }

  const wantPeople=kind==="person" || (!kind && Boolean(q));
  const [recordsResult,proofsResult,goalsResult,teamsResult,peopleResult,settingsResult,followingResult]=await Promise.all([
    kind && kind!=="record" ? Promise.resolve({data:[] as any[],error:null}) : recordsQuery,
    kind && kind!=="proof" ? Promise.resolve({data:[] as any[],error:null}) : proofsQuery,
    kind && kind!=="goal" ? Promise.resolve({data:[] as any[],error:null}) : goalsQuery,
    kind && kind!=="team" ? Promise.resolve({data:[] as any[],error:null}) : teamsQuery,
    wantPeople ? peopleQuery : Promise.resolve({data:[] as any[],error:null}),
    supabase.from("profiles").select("primary_domains").eq("id",userId).maybeSingle(),
    supabase.from("follows").select("following_id").eq("follower_id",userId),
  ]);

  const errors=[recordsResult.error,proofsResult.error,goalsResult.error,teamsResult.error,peopleResult.error].filter(Boolean);
  const records=(recordsResult.data||[]).slice(0,recordLimit);
  const proofs=(proofsResult.data||[]).slice(0,proofLimit);
  const goals=(goalsResult.data||[]).slice(0,goalLimit);
  const teams=(teamsResult.data||[]).slice(0,teamLimit);
  const people=(peopleResult.data||[]).slice(0,personLimit);
  const hasMore=(recordsResult.data?.length||0)>recordLimit || (proofsResult.data?.length||0)>proofLimit
    || (goalsResult.data?.length||0)>goalLimit || (teamsResult.data?.length||0)>teamLimit
    || (peopleResult.data?.length||0)>personLimit;

  const ownerIds=[...new Set([...proofs.map((p:any)=>p.owner_id),...goals.map((g:any)=>g.owner_id)].filter(Boolean))];
  const {data:owners}=ownerIds.length
    ? await supabase.from("profiles").select("id,display_name,handle,avatar_url").in("id",ownerIds)
    : {data:[] as any[]};
  const ownerMap=new Map((owners||[]).map((owner:any)=>[owner.id,owner]));
  const followed=new Set((followingResult.data||[]).map((f:any)=>f.following_id));
  const interested=new Set(settingsResult.data?.primary_domains||[]);

  const items:DiscoveryItem[]=[
    ...records.map((r:any)=>({
      id:r.id,kind:"record" as const,domain:r.domain,date:r.occurred_at,body:r.body,media:r.media,
      href:`/record/${r.id}`,authorId:r.author_id,
      authorName:r.profiles?.display_name||r.profiles?.handle||"프로프 사용자",
      authorHandle:r.profiles?.handle||null,authorAvatar:r.profiles?.avatar_url||null,meta:"기록",
    })),
    ...proofs.map((p:any)=>{
      const owner=ownerMap.get(p.owner_id) as any;
      return {id:p.id,kind:"proof" as const,domain:p.domain,date:p.happened_at,title:p.title,body:p.description,
        href:`/proof/${p.id}`,authorId:p.owner_id,authorName:owner?.display_name||owner?.handle||"프로프 사용자",
        authorHandle:owner?.handle||null,authorAvatar:owner?.avatar_url||null,meta:"Proof"};
    }),
    ...goals.map((g:any)=>{
      const owner=ownerMap.get(g.owner_id) as any;
      return {id:g.id,kind:"goal" as const,domain:g.domain,date:g.created_at,title:g.title,body:g.why,
        href:`/goal/${g.id}`,authorId:g.owner_id,authorName:owner?.display_name||owner?.handle||"프로프 사용자",
        authorHandle:owner?.handle||null,authorAvatar:owner?.avatar_url||null,meta:g.current_stage||"Goal"};
    }),
    ...teams.map((t:any)=>{
      const roles=(t.team_roles||[]).filter((r:any)=>r.is_open).map((r:any)=>r.title).slice(0,2);
      return {id:t.id,kind:"team" as const,domain:t.domain,date:t.created_at,title:t.name,body:t.mission,
        href:`/team/${t.id}`,authorId:t.owner_id,meta:roles.length ? `${roles.join(" · ")} 모집` : "TEAM"};
    }),
    ...people.map((p:any)=>({
      id:p.id,kind:"person" as const,domain:p.primary_domains?.[0]||"people",date:p.created_at,
      title:p.display_name||p.handle||"프로프 사용자",body:p.headline||p.bio||"지금 하고 있는 일을 확인해 보세요.",
      href:`/profile/${p.id}`,authorId:p.id,authorName:p.display_name||p.handle||"프로프 사용자",
      authorHandle:p.handle||null,authorAvatar:p.avatar_url||null,meta:"사람",
    })),
  ];

  items.sort((a,b)=>{
    if(sort==="recent") return +new Date(b.date)-+new Date(a.date);
    const score=(item:DiscoveryItem)=> timeScore(item.date)
      +(interested.has(item.domain)?26:0)
      +(item.authorId&&followed.has(item.authorId)?22:0)
      +(item.kind==="team"?8:0)
      +(item.kind==="proof"?5:0);
    return score(b)-score(a) || (+new Date(b.date)-+new Date(a.date));
  });

  const filter={q,domain,kind,sort};
  return <div className="explore-page-v16">
    <header className="explore-head-v16">
      <div><h1>{t.nav.explore}</h1><p>{en ? "Discover what people are building and the teams you can join." : "진행 중인 일, 사람, 함께할 팀을 발견하세요."}</p></div>
      <span className="explore-count-v16">{items.length ? (en ? `${items.length} results on this page` : `이번 페이지 ${items.length}개`) : "EXPLORE"}</span>
    </header>

    <form className="explore-search explore-search-v8 explore-search-v16" action="/explore" method="get">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.2 4.2"/></svg>
      <input name="q" maxLength={60} defaultValue={q} placeholder={en ? "Search people, updates, goals, teams" : "사람, 기록, Goal, TEAM 검색"} aria-label={t.common.search}/>
      {domain && <input type="hidden" name="domain" value={domain}/>}
      {kind && <input type="hidden" name="kind" value={kind}/>}
      {sort!=="relevant" && <input type="hidden" name="sort" value={sort}/>}
      <button type="submit" className="explore-search-submit-v16">{t.common.search}</button>
    </form>

    <div className="explore-filter-stack explore-filter-v16">
      <nav className="explore-kind-tabs" aria-label={en ? "Discover types" : "탐색 유형"}>
        {[
          ["",en ? "All" : "모두"],["record",en ? "Records" : "기록"],["person",t.common.people],["team","TEAM"],["goal","Goal"],["proof","Proof"],
        ].map(([value,label])=><Link key={value} className={kind===value?"active":""}
          href={exploreHref({...filter,kind:value,page:"1"})}>{label}</Link>)}
        <Link href="/opportunity">{t.nav.opportunity}</Link>
      </nav>
      <div className="explore-secondary-filter-v16">
        <nav className="explore-domain-tabs" aria-label={en ? "Categories" : "관심 분야"}>
          <Link className={!domain?"active":""} href={exploreHref({...filter,domain:"",page:"1"})}>{en ? "All categories" : "전체 분야"}</Link>
          {domains.map(d=><Link key={d} className={domain===d?"active":""}
            href={exploreHref({...filter,domain:d,page:"1"})}>{(t.domains as Record<string,string>)[d] ?? humanDomains[d]}</Link>)}
        </nav>
        <div className="explore-sort-v16">
          <Link className={sort==="relevant"?"active":""} href={exploreHref({...filter,sort:"relevant",page:"1"})}>{en ? "Relevant" : "추천순"}</Link>
          <Link className={sort==="recent"?"active":""} href={exploreHref({...filter,sort:"recent",page:"1"})}>{en ? "Newest" : "최신순"}</Link>
        </div>
      </div>
    </div>

    <DiscoveryTracker userId={userId}/>
    {errors.length>0 && <div className="explore-error-v16" role="alert">{en ? "Some results could not be loaded. Please try again." : "일부 결과를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."}</div>}
    {items.length ? <div className="discovery-grid-v8 discovery-grid-v16">
      {items.map(item=>{
        const hasMedia=Array.isArray(item.media)&&item.media.length>0;
        const prominent=item.kind==="proof"||(item.kind==="record"&&hasMedia);
        const classNames=["discovery-tile-v8","discovery-tile-v16",`tile-${item.kind}`,hasMedia?"tile-has-media":"",
          prominent?"tile-featured":""].filter(Boolean).join(" ");
        return <article className={classNames} key={`${item.kind}-${item.id}`}
          data-discovery-id={item.id} data-discovery-kind={item.kind}>
          <Link href={item.href} className="discovery-tile-link" aria-label={item.title||excerpt(item.body,30)||"기록 열기"}>
            <div className="tile-topline">
              <span className="tile-kind">{item.kind==="record"?"RECORD":item.kind.toUpperCase()}</span>
              <span>{(t.domains as Record<string,string>)[item.domain] ?? t.domains.other}</span>
            </div>
            <RecordMedia media={item.media} variant="grid"/>
            <div className="tile-main">
              {item.title && <h2>{excerpt(item.title,90)}</h2>}
              <p>{excerpt(item.body,prominent?175:105)}</p>
            </div>
          </Link>
          <div className="tile-bottom">
            {item.kind==="person" ? <span className="tile-author"><ProfileAvatar userId={item.authorAvatar?item.authorId:null} name={item.authorName} version={item.authorAvatar}/>
              <span><b>{item.authorName}</b><small>@{item.authorHandle||"user"}</small></span></span>
              : item.authorId ? <Link className="tile-author" href={`/profile/${item.authorId}`} aria-label={`${item.authorName||"작성자"} 프로필`}>
                <i>{String(item.authorName||"?").slice(0,1)}</i>
                <span><b>{item.authorName||"프로프 사용자"}</b>{item.authorHandle&&<small>@{item.authorHandle}</small>}</span>
              </Link> : <span className="tile-author"><i>T</i><span><b>TEAM</b></span></span>}
            <span className="tile-meta">{item.meta}</span>
          </div>
        </article>;
      })}
    </div> : <ExploreEmpty locale={locale} searched={Boolean(q||domain||kind||page>1)}/>}

    {(hasMore||page>1)&&<nav className="explore-pager-v16" aria-label={en ? "Explore pages" : "탐색 페이지"}>
      {page>1&&<Link href={exploreHref({...filter,page:String(page-1)})}>← {en ? "Previous" : "이전"}</Link>}
      <span>{page} {en ? "page" : "페이지"}</span>
      {hasMore&&<Link href={exploreHref({...filter,page:String(page+1)})}>{en ? "Discover more" : "더 발견하기"} →</Link>}
    </nav>}
  </div>;
}
