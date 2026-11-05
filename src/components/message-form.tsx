"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function MessageForm({ conversationId, userId }: { conversationId: string; userId: string }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    setError("");
    const body = text.trim();
    const { error: sendError } = await createClient().from("messages")
      .insert({ conversation_id: conversationId, sender_id: userId, body, message_type: "text" });
    if (sendError) setError("메시지를 보내지 못했습니다. 다시 시도해 주세요.");
    else { setText(""); router.refresh(); }
    setBusy(false);
  }

  return <form className="message-compose" onSubmit={submit}>
    <input value={text} onChange={(e) => setText(e.target.value)} placeholder="메시지를 입력하세요" disabled={busy} maxLength={4000} />
    <button className="btn primary" type="submit" disabled={busy || !text.trim()}>{busy ? "전송 중" : "보내기"}</button>
    {error && <div role="alert" className="error notice">{error}</div>}
  </form>;
}
