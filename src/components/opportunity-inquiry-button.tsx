"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { messagesFor, type Locale } from "@/lib/i18n";

type Props = {
  userId: string;
  ownerId: string;
  opportunityId: string;
  opportunityTitle: string;
  locale?: Locale;
};

/**
 * A private inquiry in the existing message-request workflow, not a formal
 * job application or an acceptance. The recipient can reply in Messages.
 */
export function OpportunityInquiryButton({ userId, ownerId, opportunityId, opportunityTitle, locale = "ko" }: Props) {
  const t = messagesFor(locale);
  const o = t.opportunity;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = note.trim();
    if (busy || !body || body.length > 1000 || userId === ownerId) return;
    setBusy(true);
    setError("");

    try {
      const supabase = createClient();
      const participants = [userId, ownerId].sort();
      const { data: existing, error: lookupError } = await supabase
        .from("conversations")
        .select("id")
        .eq("kind", "request")
        .is("team_id", null)
        .eq("title", "기회 문의")
        .contains("participant_ids", participants)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lookupError) throw lookupError;

      let conversationId = existing?.id;
      if (!conversationId) {
        const { data: created, error: createError } = await supabase.from("conversations")
          .insert({
            kind: "request",
            participant_ids: participants,
            created_by: userId,
            title: "기회 문의",
          })
          .select("id")
          .single();
        if (createError || !created?.id) throw createError ?? new Error("메시지함을 만들 수 없습니다.");
        conversationId = created.id;
      }

      const { error: sendError } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        body,
        message_type: "opportunity_inquiry",
        payload: { opportunity_id: opportunityId, opportunity_title: opportunityTitle },
      });
      if (sendError) throw sendError;
      setOpen(false);
      router.push(`/messages/${conversationId}`);
      router.refresh();
    } catch {
      setError(o.inquiryError);
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button type="button" className="btn primary" onClick={() => setOpen(true)}>
      {o.inquiry}
    </button>
    {open && <div className="overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) setOpen(false);
    }}>
      <form className="sheet" onSubmit={send}>
        <div className="grab" />
        <h2>{o.inquiryTitle}</h2>
        <p className="meta">{opportunityTitle}</p>
        <label className="field">
          <span>{o.inquiryLabel}</span>
          <textarea required rows={5} value={note} maxLength={1000} disabled={busy}
            onChange={(event) => setNote(event.target.value)}
            placeholder={o.inquiryPlaceholder} />
        </label>
        <p className="meta">{o.inquiryHint}</p>
        {error && <div className="error notice" role="alert">{error}</div>}
        <div className="row">
          <button type="button" className="btn secondary full" disabled={busy} onClick={() => setOpen(false)}>{t.common.cancel}</button>
          <button type="submit" className="btn primary full" disabled={busy || !note.trim()}>
            {busy ? t.common.sending : o.inquirySend}
          </button>
        </div>
      </form>
    </div>}
  </>;
}
