"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Comment = {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
  authorName: string;
  authorHandle: string | null;
};

export function RecordComments({ recordId, userId, recordOwnerId, initial }: {
  recordId: string;
  userId: string;
  recordOwnerId: string;
  initial: Comment[];
}) {
  const [comments, setComments] = useState(initial);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = body.trim();
    if (!value || value.length > 1000 || busy) return;
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error: insertError } = await supabase.from("record_comments")
      .insert({ record_id: recordId, author_id: userId, body: value });
    if (insertError) {
      setError("댓글을 남기지 못했습니다. 다시 시도해 주세요.");
    } else {
      setBody("");
      router.refresh();
      // Refresh visible list from the database to avoid local-only placeholder comments.
      const { data } = await supabase.from("record_comments")
        .select("id,author_id,body,created_at")
        .eq("record_id", recordId).order("created_at",{ascending:true}).limit(100);
      if (data) {
        const ids = [...new Set(data.map((item) => item.author_id))];
        const { data: authors } = ids.length
          ? await supabase.from("profiles").select("id,display_name,handle").in("id",ids)
          : { data: [] as { id: string; display_name: string | null; handle: string | null }[] };
        const map = new Map((authors || []).map((author) => [author.id, author]));
        setComments(data.map((item) => ({
          ...item,
          authorName: map.get(item.author_id)?.display_name || "프로프 사용자",
          authorHandle: map.get(item.author_id)?.handle || null,
        })));
      }
    }
    setBusy(false);
  }

  async function remove(id: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error: removeError } = await supabase.from("record_comments").delete().eq("id",id);
    if (removeError) setError("댓글을 삭제하지 못했습니다.");
    else {
      setComments((items) => items.filter((item) => item.id !== id));
      router.refresh();
    }
    setBusy(false);
  }

  return <section id="comments" className="record-comments-v10" aria-label="댓글">
    <header><h2>댓글 <span>{comments.length}</span></h2></header>
    {comments.length ? <div className="record-comment-list">
      {comments.map((c) => <article className="record-comment" key={c.id}>
        <div className="record-comment-author"><span><b>{c.authorName}</b>{c.authorHandle && <small>@{c.authorHandle}</small>}</span><time>{new Date(c.created_at).toLocaleDateString("ko-KR")}</time></div>
        <p>{c.body}</p>
        {(c.author_id === userId || recordOwnerId === userId) && <button type="button" disabled={busy} onClick={() => remove(c.id)} aria-label="댓글 삭제">삭제</button>}
      </article>)}
    </div> : <p className="record-comment-empty">첫 댓글을 남겨보세요.</p>}
    <form className="record-comment-form" onSubmit={submit}>
      <label htmlFor="gieoi-comment-body">댓글 남기기</label>
      <textarea id="gieoi-comment-body" maxLength={1000} value={body} onChange={(event) => setBody(event.target.value)} placeholder="기록에 대한 생각을 나눠보세요." rows={3} disabled={busy}/>
      <div className="record-comment-actions"><span>{body.length}/1000</span><button className="btn primary" type="submit" disabled={busy || !body.trim()}>{busy ? "게시 중..." : "댓글 게시"}</button></div>
    </form>
    {error && <div className="error notice" role="alert">{error}</div>}
  </section>;
}
