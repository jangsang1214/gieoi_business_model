"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function TeamProposalButton({ me, target, teams }: { me: string; target: string; teams: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (!teams.length) return null;

  async function submit(fd: FormData) {
    setBusy(true);
    setError("");
    const teamId = String(fd.get("team_id") || "");
    const team = teams.find((x) => x.id === teamId);
    const note = String(fd.get("note") || "").trim();
    const supabase = createClient();
    const { data, error } = await supabase.from("conversations").insert({
      kind: "request",
      participant_ids: [me, target],
      team_id: teamId,
      created_by: me,
      title: `${team?.name || "TEAM"} 제안`,
    }).select("id").single();

    if (error || !data) {
      setError(error?.message || "제안을 만들지 못했습니다.");
      setBusy(false);
      return;
    }

    await supabase.from("messages").insert({
      conversation_id: data.id,
      sender_id: me,
      body: note || `${team?.name || "TEAM"}에서 함께하고 싶어요.`,
      message_type: "team_proposal",
      payload: { team_id: teamId, team_name: team?.name || "TEAM" },
    });

    setBusy(false);
    setOpen(false);
    router.push(`/messages/${data.id}`);
  }

  return <>
    <button className="btn secondary" onClick={() => setOpen(true)}>TEAM 제안</button>
    {open && <div className="overlay"><form className="sheet" action={submit}>
      <div className="grab" />
      <h2>TEAM 제안</h2>
      <label className="field">TEAM<select name="team_id" required>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
      <label className="field">메시지 <span className="optional">선택</span><textarea name="note" rows={4} placeholder="왜 같이하고 싶은지 짧게 남겨보세요." /></label>
      {error && <div className="error notice">{error}</div>}
      <div className="row"><button type="button" className="btn secondary full" onClick={() => setOpen(false)}>취소</button><button className="btn primary full" disabled={busy}>{busy ? "보내는 중..." : "제안 보내기"}</button></div>
    </form></div>}
  </>;
}
