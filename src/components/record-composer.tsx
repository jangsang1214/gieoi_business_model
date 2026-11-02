"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const domains = ["business", "workout", "create", "study", "career", "lifestyle"];
const types = ["journey", "proof"];

type LinkOption = { id: string; title?: string; name?: string };

export function RecordComposer({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [domain, setDomain] = useState("business");
  const [type, setType] = useState("journey");
  const [goalId, setGoalId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [goals, setGoals] = useState<LinkOption[]>([]);
  const [teams, setTeams] = useState<LinkOption[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const openComposer = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: string; goalId?: string; teamId?: string }>).detail;
      setType(detail?.type && types.includes(detail.type) ? detail.type : "journey");
      setGoalId(detail?.goalId || "");
      setTeamId(detail?.teamId || "");
      setOpen(true);
    };
    window.addEventListener("gieoi:compose", openComposer);
    return () => window.removeEventListener("gieoi:compose", openComposer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const loadLinks = async () => {
      const supabase = createClient();
      const [{ data: goalRows }, { data: memberships }] = await Promise.all([
        supabase.from("goals").select("id,title").eq("owner_id", userId).eq("status", "active").order("created_at", { ascending: false }),
        supabase.from("team_members").select("team_id,teams(id,name)").eq("user_id", userId).eq("status", "active"),
      ]);
      setGoals(goalRows || []);
      setTeams((memberships || []).map((m: any) => m.teams).filter(Boolean));
    };
    loadLinks();
  }, [open, userId]);

  if (pathname.startsWith("/settings")) return null;

  async function submit() {
    if (!body.trim()) return;
    setBusy(true);
    setErr("");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("records")
      .insert({
        author_id: userId,
        domain,
        type,
        body: body.trim(),
        visibility: "public",
        goal_id: goalId || null,
        team_id: teamId || null,
      })
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
        .insert({
          owner_id: userId,
          domain,
          title: body.trim().slice(0, 80),
          description: body.trim(),
          record_id: data.id,
          goal_id: goalId || null,
          team_id: teamId || null,
          visibility: "public",
        })
        .select("id")
        .single();
      if (p.data) await supabase.from("proof_provenance").insert({ proof_id: p.data.id, kind: "self" });
    }

    setBusy(false);
    setBody("");
    setGoalId("");
    setTeamId("");
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
            <div className="composer-links">
              <label className="field compact-field">Goal <span className="optional">선택</span><select value={goalId} onChange={(e) => setGoalId(e.target.value)}><option value="">연결 안 함</option>{goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}</select></label>
              <label className="field compact-field">TEAM <span className="optional">선택</span><select value={teamId} onChange={(e) => setTeamId(e.target.value)}><option value="">연결 안 함</option>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
            </div>
            <label className="field compact-field">분야<select value={domain} onChange={(e) => setDomain(e.target.value)}>{domains.map((x) => <option key={x} value={x}>{x.toUpperCase()}</option>)}</select></label>
            {err && <div className="error notice">{err}</div>}
            <div className="row composer-actions"><button className="btn secondary full" onClick={() => setOpen(false)}>취소</button><button className="btn primary full" onClick={submit} disabled={busy}>{busy ? "저장 중..." : "게시"}</button></div>
          </div>
        </div>
      )}
    </>
  );
}
