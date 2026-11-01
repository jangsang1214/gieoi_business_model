"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const domains = ["business", "workout", "create", "study", "career", "lifestyle"];
const types = ["life", "journey", "proof", "thought"];

export function RecordComposer({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [domain, setDomain] = useState("business");
  const [type, setType] = useState("life");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const openComposer = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: string }>).detail;
      if (detail?.type && types.includes(detail.type)) setType(detail.type);
      setOpen(true);
    };
    window.addEventListener("gieoi:compose", openComposer);
    return () => window.removeEventListener("gieoi:compose", openComposer);
  }, []);

  if (pathname.startsWith("/settings")) return null;

  async function submit() {
    if (!body.trim()) return;
    setBusy(true);
    setErr("");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("records")
      .insert({ author_id: userId, domain, type, body: body.trim(), visibility: "public" })
      .select("id")
      .single();

    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }

    if (type === "proof" && data) {
      const p = await supabase
        .from("proofs")
        .insert({ owner_id: userId, domain, title: body.trim().slice(0, 80), description: body.trim(), record_id: data.id, visibility: "public" })
        .select("id")
        .single();
      if (p.data) await supabase.from("proof_provenance").insert({ proof_id: p.data.id, kind: "self" });
    }

    setBusy(false);
    setBody("");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button className="fab" onClick={() => setOpen(true)} aria-label="새 기록">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </button>
      {open && (
        <div className="overlay" onMouseDown={(e) => { if (e.currentTarget === e.target) setOpen(false); }}>
          <div className="sheet">
            <div className="grab" />
            <div className="sheet-kicker">NEW RECORD</div>
            <h2>오늘의 삶을 남기기</h2>
            <p>작은 기록도 Goal, Proof, TEAM과 연결되며 하나의 궤적이 됩니다.</p>
            <div className="composer-grid">
              <label className="field">분야<select value={domain} onChange={(e) => setDomain(e.target.value)}>{domains.map((x) => <option key={x}>{x.toUpperCase()}</option>)}</select></label>
              <label className="field">기록 타입<select value={type} onChange={(e) => setType(e.target.value)}>{types.map((x) => <option key={x}>{x.toUpperCase()}</option>)}</select></label>
            </div>
            <label className="field">기록<textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="오늘 무엇을 했고, 무엇이 달라졌나요?" /></label>
            {err && <div className="error notice">{err}</div>}
            <div className="row composer-actions"><button className="btn secondary full" onClick={() => setOpen(false)}>취소</button><button className="btn primary full" onClick={submit} disabled={busy}>{busy ? "저장 중..." : "내 삶에 남기기"}</button></div>
          </div>
        </div>
      )}
    </>
  );
}
