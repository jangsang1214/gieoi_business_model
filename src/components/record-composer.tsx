"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const domains = ["business", "workout", "create", "study", "career", "lifestyle"];
const types = ["journey", "proof"];

export function RecordComposer({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [domain, setDomain] = useState("business");
  const [type, setType] = useState("journey");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const openComposer = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: string }>).detail;
      if (detail?.type && types.includes(detail.type)) setType(detail.type);
      else setType("journey");
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
      <button className="fab" onClick={() => { setType("journey"); setOpen(true); }} aria-label="새 기록">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </button>
      {open && (
        <div className="overlay" onMouseDown={(e) => { if (e.currentTarget === e.target) setOpen(false); }}>
          <div className="sheet composer-v4">
            <div className="grab" />
            <div className="composer-mode" role="tablist" aria-label="기록 종류">
              <button className={type === "journey" ? "active" : ""} onClick={() => setType("journey")}>기록</button>
              <button className={type === "proof" ? "active" : ""} onClick={() => setType("proof")}>Proof</button>
            </div>
            <label className="field composer-body">{type === "proof" ? "무엇을 해냈나요?" : "지금 무엇을 하고 있나요?"}<textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder={type === "proof" ? "결과, 기록, 수상, 출시처럼 남길 만한 것을 적어보세요." : "짧게 남겨도 충분합니다."} /></label>
            <label className="field compact-field">분야<select value={domain} onChange={(e) => setDomain(e.target.value)}>{domains.map((x) => <option key={x} value={x}>{x.toUpperCase()}</option>)}</select></label>
            {err && <div className="error notice">{err}</div>}
            <div className="row composer-actions"><button className="btn secondary full" onClick={() => setOpen(false)}>취소</button><button className="btn primary full" onClick={submit} disabled={busy}>{busy ? "저장 중..." : "게시"}</button></div>
          </div>
        </div>
      )}
    </>
  );
}
