"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { messagesFor, type Locale } from "@/lib/i18n";

export function MessageForm({ conversationId, userId, locale = "ko" }: { conversationId: string; userId: string; locale?: Locale }) {
  const t = messagesFor(locale).messages;
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
    if (sendError) setError(t.sendError);
    else { setText(""); router.refresh(); }
    setBusy(false);
  }

  return <form className="message-compose" onSubmit={submit}>
    <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t.writePlaceholder} disabled={busy} maxLength={4000} />
    <button className="btn primary" type="submit" disabled={busy || !text.trim()}>{busy ? t.sending : t.send}</button>
    {error && <div role="alert" className="error notice">{error}</div>}
  </form>;
}
