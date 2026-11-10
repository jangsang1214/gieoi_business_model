import Link from "next/link";
import {requireUser} from "@/lib/auth";
import {StartDmButton} from "@/components/start-dm-button";
import {ProfileAvatar} from "@/components/profile-avatar";
import {MessageInboxRealtime} from "@/components/message-inbox-realtime";
import { getLocale } from "@/lib/i18n-server";
import { messagesFor } from "@/lib/i18n";

export default async function Messages({searchParams}:{searchParams:Promise<{tab?:string}>}){
 const {supabase,userId}=await requireUser();
 const locale=await getLocale();
 const t=messagesFor(locale);
 const params=await searchParams;
 const tab=["team","request"].includes(String(params.tab))?String(params.tab):"all";
 const [{data:conversations,error:inboxError},{data:people}]=await Promise.all([
   supabase.rpc("inbox_overview",{p_limit:80}),
   supabase.from("profiles").select("id,display_name,headline,avatar_url")
      .neq("id",userId).eq("discoverable",true).limit(8)
 ]);
 const all=(conversations||[]) as any[];
 const otherIds=[...new Set(all.flatMap(c=>(c.participant_ids||[]).filter((id:string)=>id!==userId)))];
 const {data:members}=otherIds.length?await supabase.from("profiles")
    .select("id,display_name,handle,avatar_url").in("id",otherIds):{data:[] as any[]};
 const profileMap=new Map((members||[]).map((p:any)=>[p.id,p]));
 const visible=all.filter(c=>tab==="all" || (tab==="team"?c.kind==="team":["request","scout"].includes(c.kind)));
 const unreadTotal=all.reduce((n,c)=>n+Number(c.unread_count||0),0);
 return <>
   <MessageInboxRealtime/>
   <header className="utility-head">
     <div><h1>{t.messages.title}</h1><p>{t.messages.subtitle}</p></div>
     {unreadTotal>0&&<span className="inbox-count-v19">{unreadTotal>99?"99+":unreadTotal}{t.messages.newCount}</span>}
   </header>
   <div className="tabs inbox-tabs">
      <Link href="/messages" className={`pill ${tab==="all"?"active":""}`}>{t.messages.all}</Link>
      <Link href="/messages?tab=team" className={`pill ${tab==="team"?"active":""}`}>TEAM</Link>
      <Link href="/messages?tab=request" className={`pill ${tab==="request"?"active":""}`}>{t.messages.requests}</Link>
   </div>
   {inboxError&&<div className="error notice" role="alert">{t.messages.loadError}</div>}
   {visible.length?visible.map((c:any)=>{
      const other=(c.participant_ids||[]).find((id:string)=>id!==userId);
      const person=profileMap.get(other) as any;
      const name=c.team_name||c.title||(person?.display_name||person?.handle)||(c.kind==="dm"?t.messages.title:t.messages.proposal);
      const unread=Number(c.unread_count||0);
      return <Link className={`conv prof-inbox-row-v19 ${unread?"unread":""}`} href={`/messages/${c.id}`} key={c.id}>
        {c.kind==="team"?<span className="avatar">T</span>
          :<ProfileAvatar userId={person?.avatar_url?other:null} name={name} version={person?.avatar_url}/>}
        <div className="grow"><b>{name}</b><p>{c.last_body||t.messages.start}</p></div>
        <div className="prof-inbox-end-v19">
          <time>{new Date(c.last_activity_at||c.created_at).toLocaleDateString("ko-KR")}</time>
          {unread>0&&<span className="inbox-unread-v19" aria-label={`읽지 않은 메시지 ${unread}개`}>{unread>99?"99+":unread}</span>}
        </div>
      </Link>;
   }):<div className="empty"><h3>{tab==="all"?t.messages.emptyAll:t.messages.emptyFilter}</h3><p>{t.messages.emptyHint}</p></div>}
   <section className="discover-section inbox-people">
     <div className="section-title-row"><div><span>PEOPLE</span><h2>{t.messages.people}</h2></div><Link href="/explore?kind=person" className="quiet-link">{t.messages.more}</Link></div>
     {people?.length?<div className="people-grid">{people.map((p:any)=><article className="person-card" key={p.id}>
       <Link href={`/profile/${p.id}`} className="person-card-link"><div className="person-top">
         <ProfileAvatar userId={p.avatar_url?p.id:null} name={p.display_name} size="large" version={p.avatar_url}/>
         <div className="grow"><h3>{p.display_name||t.common.unknownUser}</h3><div className="meta">{p.headline||""}</div></div>
       </div></Link><div className="person-action"><StartDmButton me={userId} target={p.id} locale={locale}/></div>
     </article>)}</div>:null}
   </section>
 </>;
}
