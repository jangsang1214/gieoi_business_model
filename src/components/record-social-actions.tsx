"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";

export function RecordSocialActions({ recordId, userId, initiallyLiked, initialLikes, locale, commentsAllowed = true, unavailable = false }: {
  recordId: string; userId: string; initiallyLiked: boolean; initialLikes: number;
  locale: Locale; commentsAllowed?: boolean; unavailable?: boolean;
}) {
  const en = locale === "en";
  const [liked, setLiked] = useState(initiallyLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const inFlight = useRef(false);
  const router = useRouter();

  async function toggleLike() {
    if (inFlight.current || unavailable) return;
    inFlight.current = true;
    setBusy(true); setError("");
    const next = !liked;
    setLiked(next);
    setLikes(n => Math.max(0, n + (next ? 1 : -1)));
    try {
      const supabase = createClient();
      const { error: dbError } = next
        ? await supabase.from("record_likes").insert({ record_id: recordId, user_id: userId })
        : await supabase.from("record_likes").delete().eq("record_id", recordId).eq("user_id", userId);
      if (dbError) throw dbError;
      router.refresh();
    } catch {
      setLiked(!next);
      setLikes(n => Math.max(0, n + (next ? -1 : 1)));
      setError(en ? "Could not update reaction. Try again." : "반응을 저장하지 못했습니다. 다시 시도해 주세요.");
    } finally { inFlight.current = false; setBusy(false); }
  }

  async function shareRecord() {
    setCopied(false); setError("");
    const url = new URL(`/record/${recordId}`, window.location.origin).href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "prof. · Record", url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      } else {
        setError(en ? "Copy the URL from this record's page." : "기록 페이지에서 주소를 복사해 주세요.");
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        setError(en ? "Sharing failed. Try again." : "공유하지 못했습니다. 다시 시도해 주세요.");
      }
    }
  }

  return <div className="record-social-actions">
    <div className="record-social-row">
      <button type="button" onClick={toggleLike} disabled={busy || unavailable}
        className={liked ? "record-social-liked" : ""} aria-pressed={liked}
        aria-label={liked ? (en ? "Unlike record" : "좋아요 취소") : (en ? "Like record" : "좋아요")}>
        <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
        <span>{unavailable ? "—" : likes}</span>
      </button>
      {commentsAllowed ? <Link href={`/record/${recordId}#comments`} aria-label={en ? "View comments" : "댓글 보기"}>
        <span aria-hidden="true">◌</span>
        <span>{en ? "Comment" : "댓글"}</span>
      </Link> : <Link href={`/record/${recordId}`}>{en ? "View record" : "기록 보기"}</Link>}
      <button type="button" onClick={shareRecord}>
        <span aria-hidden="true">↗</span>
        <span>{copied ? (en ? "Link copied" : "링크 복사됨") : (en ? "Share" : "공유")}</span>
      </button>
    </div>
    {unavailable && <span role="status" className="error">{en ? "Reactions are temporarily unavailable." : "반응을 불러오지 못했습니다."}</span>}
    {copied && <span role="status" className="meta">{en ? "Link copied" : "링크 복사됨"}</span>}
    {error && <span className="error" role="alert">{error}</span>}
  </div>;
}
