import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { MessageForm } from "@/components/message-form";
import { ReportButton } from "@/components/report-button";
import { MessageThreadRealtime } from "@/components/message-thread-realtime";

export default async function Thread({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, userId } = await requireUser();
  const { data: conv } = await supabase.from("conversations").select("id,kind,title,participant_ids,team_id,teams(id,name)").eq("id", id).maybeSingle();
  if (!conv) notFound();
  const { data: messages } = await supabase.from("messages").select("id,body,sender_id,created_at,message_type,payload").eq("conversation_id", id).order("created_at",{ascending:false}).limit(100);

  return <>
    <MessageThreadRealtime conversationId={id}/>
    <header className="utility-head thread-head">
      <div><Link href="/messages" className="meta">← 메시지</Link><h1>{(conv as any).teams?.name || conv.title || "Direct Message"}</h1></div>
      {(conv as any).team_id && <Link href={`/team/${(conv as any).team_id}`} className="btn secondary">TEAM 보기</Link>}
    </header>
    <div className="message-list">{messages?.slice().reverse().map((m: any) => {
      const proposalTeamId = m.message_type === "team_proposal" ? m.payload?.team_id : null;
      const proposalTeamName = m.message_type === "team_proposal" ? m.payload?.team_name : null;
      const inquiryId = m.message_type === "opportunity_inquiry" && typeof m.payload?.opportunity_id === "string"
        && /^[0-9a-f-]{36}$/i.test(m.payload.opportunity_id) ? m.payload.opportunity_id : null;
      const inquiryTitle = m.message_type === "opportunity_inquiry" && typeof m.payload?.opportunity_title === "string"
        ? m.payload.opportunity_title : "기회 문의";
      return <div className={m.sender_id === userId ? "msg me" : "msg"} key={m.id}>
        <div className="bubble">{proposalTeamId && <Link href={`/team/${proposalTeamId}`} className="proposal-chip">TEAM · {proposalTeamName || "제안"}</Link>}
          {inquiryId && <Link href={`/opportunity/${inquiryId}`} className="proposal-chip">기회 · {inquiryTitle}</Link>}
          <div>{m.body}</div></div>{m.sender_id !== userId && <ReportButton userId={userId} targetType="message" targetId={m.id}/>} 
      </div>;
    })}</div>
    <MessageForm conversationId={id} userId={userId} />
  </>;
}
