import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { MessageForm } from "@/components/message-form";
import { ReportButton } from "@/components/report-button";

export default async function Thread({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, userId } = await requireUser();
  const { data: conv } = await supabase.from("conversations").select("id,kind,title,participant_ids,team_id,teams(id,name)").eq("id", id).maybeSingle();
  if (!conv) notFound();
  const { data: messages } = await supabase.from("messages").select("id,body,sender_id,created_at,message_type,payload").eq("conversation_id", id).order("created_at");

  return <>
    <header className="utility-head thread-head">
      <div><Link href="/messages" className="meta">← 메시지</Link><h1>{(conv as any).teams?.name || conv.title || "Direct Message"}</h1></div>
      {(conv as any).team_id && <Link href={`/team/${(conv as any).team_id}`} className="btn secondary">TEAM 보기</Link>}
    </header>
    <div className="message-list">{messages?.map((m: any) => {
      const proposalTeamId = m.message_type === "team_proposal" ? m.payload?.team_id : null;
      const proposalTeamName = m.message_type === "team_proposal" ? m.payload?.team_name : null;
      return <div className={m.sender_id === userId ? "msg me" : "msg"} key={m.id}>
        <div className="bubble">{proposalTeamId && <Link href={`/team/${proposalTeamId}`} className="proposal-chip">TEAM · {proposalTeamName || "제안"}</Link>}<div>{m.body}</div></div>{m.sender_id !== userId && <ReportButton userId={userId} targetType="message" targetId={m.id}/>} 
      </div>;
    })}</div>
    <MessageForm conversationId={id} userId={userId} />
  </>;
}
