import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { NotificationOpenLink } from "@/components/notification-open-link";

const kinds: Record<string, string> = {
  dm: "메시지", team_proposal: "TEAM 제안", team_application: "TEAM 지원", team_join: "TEAM 합류", team_rejected: "지원 결과", comment: "댓글", follow: "팔로우", opportunity_application: "기회 지원", opportunity_decision: "기회 지원 결과", opportunity_withdrawn: "지원 철회", opportunity_outcome: "협업 결과",
};

export default async function Notifications() {
  const { supabase, userId } = await requireUser();
  const { data, error } = await supabase.from("notifications").select("id,kind,title,href,read_at,created_at,actor_id").eq("recipient_id",userId).order("created_at",{ascending:false}).limit(60);
  return <>
    <header className="utility-head"><div><h1>알림</h1><p>대화와 함께할 기회.</p></div><Link href="/messages" className="meta">메시지 보기</Link></header>
    {error ? <div className="empty"><h3>알림을 불러오지 못했습니다.</h3><p>잠시 후 다시 확인해주세요.</p></div> : data?.length ?
      <div className="notification-list">{data.map((n) => <NotificationOpenLink key={n.id} id={n.id} href={n.href} unread={!n.read_at}>
        <span className="notification-dot" aria-hidden="true"/>
        <span className="notification-copy"><small>{kinds[n.kind] || "알림"}</small><b>{n.title}</b><time>{new Date(n.created_at).toLocaleString("ko-KR")}</time></span>
        <span className="notification-go">→</span>
      </NotificationOpenLink>)}</div>
    : <div className="empty"><h3>아직 알림이 없습니다.</h3><p>새 메시지나 TEAM 지원·제안이 도착하면 여기에 나타납니다.</p></div>}
  </>;
}
