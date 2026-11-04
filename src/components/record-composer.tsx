"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const domains = ["business", "workout", "create", "study", "career", "lifestyle"];
const types = ["journey", "proof"];
const MAX_IMAGES = 4;
const MAX_SIZE = 5 * 1024 * 1024;
const EXT: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
};
type LinkOption = { id: string; title?: string; name?: string };
type Preview = { url: string; name: string };

export function RecordComposer({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [domain, setDomain] = useState("business");
  const [type, setType] = useState("journey");
  const [goalId, setGoalId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [goals, setGoals] = useState<LinkOption[]>([]);
  const [teams, setTeams] = useState<LinkOption[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [inputKey, setInputKey] = useState(0);
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
    const next = files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    setPreviews(next);
    return () => next.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [files]);

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
    void loadLinks();
  }, [open, userId]);

  if (pathname.startsWith("/settings")) return null;

  function addFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []);
    setInputKey((k) => k + 1);
    if (files.length + selected.length > MAX_IMAGES) {
      setErr("사진은 최대 4장까지 올릴 수 있습니다.");
      return;
    }
    if (selected.some((file) => !EXT[file.type] || file.size > MAX_SIZE || file.size === 0)) {
      setErr("JPG, PNG, WEBP, GIF 파일만 가능하며 각 사진은 5MB 이하여야 합니다.");
      return;
    }
    setFiles((old) => [...old, ...selected]);
    setErr("");
  }

  async function submit() {
    if ((!body.trim() && !files.length) || busy) return;
    setBusy(true);
    setErr("");
    const supabase = createClient();
    const recordId = crypto.randomUUID();
    const uploaded: string[] = [];
    let recordInserted = false;

    try {
      const media: { path: string; type: string }[] = [];
      for (const file of files) {
        const path = `${userId}/${recordId}/${crypto.randomUUID()}.${EXT[file.type]}`;
        const { error: uploadError } = await supabase.storage.from("record-media").upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });
        if (uploadError) throw uploadError;
        uploaded.push(path);
        media.push({ path, type: file.type });
      }

      const { error: recordError } = await supabase.from("records").insert({
        id: recordId, author_id: userId, domain, type,
        body: body.trim(), visibility: "public",
        goal_id: goalId || null, team_id: teamId || null, media,
      });
      if (recordError) throw recordError;
      recordInserted = true;

      if (type === "proof") {
        const { data: proof, error: proofError } = await supabase.from("proofs").insert({
          owner_id: userId, domain,
          title: body.trim().slice(0, 80) || "새로운 결과",
          description: body.trim(), record_id: recordId,
          goal_id: goalId || null, team_id: teamId || null,
          visibility: "public",
        }).select("id").single();
        if (proofError || !proof) throw proofError || new Error("Proof 저장에 실패했습니다.");
        const { error: provenanceError } = await supabase.from("proof_provenance").insert({ proof_id: proof.id, kind: "self" });
        if (provenanceError) {
          // Proof itself is saved; provenance is optional, so do not duplicate it on retry.
          console.warn("Proof provenance unavailable:", provenanceError.message);
        }
      }

      setBody("");
      setGoalId("");
      setTeamId("");
      setFiles([]);
      setOpen(false);
      router.refresh();
    } catch (e) {
      if (recordInserted) {
        // If the Proof step fails, leave the published Record intact and avoid deleting its images.
        setErr("기록은 저장됐지만 Proof 연결에 실패했습니다. 프로필에서 기록을 확인해 주세요.");
        setFiles([]);
        setBody("");
        setOpen(false);
      } else {
        if (uploaded.length) await supabase.storage.from("record-media").remove(uploaded);
        setErr(e instanceof Error ? e.message : "게시하지 못했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className="fab" onClick={() => { setType("journey"); setOpen(true); }} aria-label="새 기록">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </button>
      {open && <div className="overlay" onMouseDown={(e) => { if (e.currentTarget === e.target && !busy) setOpen(false); }}>
        <div className="sheet composer-v4 composer-media-v9">
          <div className="grab" />
          <div className="composer-mode" role="tablist" aria-label="기록 종류">
            <button disabled={busy} className={type === "journey" ? "active" : ""} onClick={() => setType("journey")}>기록</button>
            <button disabled={busy} className={type === "proof" ? "active" : ""} onClick={() => setType("proof")}>Proof</button>
          </div>
          <label className="field composer-body">{type === "proof" ? "무엇을 해냈나요?" : "지금 무엇을 하고 있나요?"}
            <textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder={type === "proof" ? "결과, 기록, 수상, 출시처럼 남길 만한 것을 적어보세요." : "짧게 남겨도 충분합니다."} disabled={busy}/>
          </label>
          {previews.length > 0 && <div className="composer-image-previews">
            {previews.map((preview, i) => <div key={preview.url} className="composer-image-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.url} alt={preview.name}/>
              <button type="button" onClick={() => setFiles((old) => old.filter((_, j) => i !== j))} disabled={busy} aria-label={`${preview.name} 삭제`}>×</button>
            </div>)}
          </div>}
          <label className="upload-image-button">＋ 사진 추가 <span>{files.length}/{MAX_IMAGES}</span>
            <input key={inputKey} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={addFiles} disabled={busy || files.length >= MAX_IMAGES}/>
          </label>
          <div className="composer-links">
            <label className="field compact-field">Goal <span className="optional">선택</span><select value={goalId} onChange={(e) => setGoalId(e.target.value)} disabled={busy}><option value="">연결 안 함</option>{goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}</select></label>
            <label className="field compact-field">TEAM <span className="optional">선택</span><select value={teamId} onChange={(e) => setTeamId(e.target.value)} disabled={busy}><option value="">연결 안 함</option>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
          </div>
          <label className="field compact-field">분야<select value={domain} onChange={(e) => setDomain(e.target.value)} disabled={busy}>{domains.map((x) => <option key={x} value={x}>{x.toUpperCase()}</option>)}</select></label>
          {err && <div className="error notice" role="alert">{err}</div>}
          <div className="row composer-actions">
            <button className="btn secondary full" disabled={busy} onClick={() => setOpen(false)}>취소</button>
            <button className="btn primary full" onClick={submit} disabled={busy || (!body.trim() && !files.length)}>{busy ? "업로드 중..." : "게시"}</button>
          </div>
        </div>
      </div>}
    </>
  );
}
