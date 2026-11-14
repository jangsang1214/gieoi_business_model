"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { messagesFor, type Locale } from "@/lib/i18n";

const domains = ["business", "workout", "create", "study", "career", "lifestyle"];
const types = ["journey", "proof"];
const MAX_IMAGES = 4;
const MAX_SIZE = 5 * 1024 * 1024;
const EXT: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
};
type LinkOption = { id: string; title?: string; name?: string };
type Preview = { url: string; name: string };

export function RecordComposer({ userId, locale = "ko" }: { userId: string; locale?: Locale }) {
  const t = messagesFor(locale).compose;
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [domain, setDomain] = useState("business");
  const [type, setType] = useState("journey");
  const [goalId, setGoalId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [visibility, setVisibility] = useState("public");
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
      setErr(t.errorPhotos);
      return;
    }
    if (selected.some((file) => !EXT[file.type] || file.size > MAX_SIZE || file.size === 0)) {
      setErr(t.errorFile);
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
        body: body.trim(), visibility,
        goal_id: goalId || null, team_id: teamId || null, media,
      });
      if (recordError) throw recordError;
      recordInserted = true;

      if (type === "proof") {
        const { data: proof, error: proofError } = await supabase.from("proofs").insert({
          owner_id: userId, domain,
          title: body.trim().slice(0, 80) || t.newProof,
          description: body.trim(), record_id: recordId,
          goal_id: goalId || null, team_id: teamId || null,
          visibility,
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
      setVisibility("public");
      setFiles([]);
      setOpen(false);
      router.refresh();
    } catch (e) {
      if (recordInserted) {
        // If the Proof step fails, leave the published Record intact and avoid deleting its images.
        setErr(t.errorProof);
        setFiles([]);
        setBody("");
        setOpen(true);
        router.refresh();
      } else {
        if (uploaded.length) await supabase.storage.from("record-media").remove(uploaded);
        setErr(e instanceof Error ? e.message : t.errorPost);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className="fab" onClick={() => { setType("journey"); setOpen(true); }} aria-label={t.new}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </button>
      {open && <div className="overlay" onMouseDown={(e) => { if (e.currentTarget === e.target && !busy) setOpen(false); }}>
        <div className="sheet composer-v4 composer-media-v9">
          <div className="grab" />
          <div className="composer-mode" role="tablist" aria-label={t.record}>
            <button disabled={busy} className={type === "journey" ? "active" : ""} onClick={() => setType("journey")}>{t.record}</button>
            <button disabled={busy} className={type === "proof" ? "active" : ""} onClick={() => setType("proof")}>Proof</button>
          </div>
          <label className="field composer-body">{type === "proof" ? t.achieved : t.doing}
            <textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder={type === "proof" ? t.proofHint : t.journeyHint} disabled={busy}/>
          </label>
          <div className="onboarding-examples" aria-label={locale === "en" ? "Writing starters" : "기록 시작 문구"}>
            {(type === "proof"
              ? (locale === "en" ? ["Today I completed...", "I shipped...", "The result was..."] : ["오늘 완성한 결과는...", "직접 만들어낸 것은...", "이번에 달성한 기록은..."])
              : (locale === "en" ? ["Today I worked on...", "The next thing I want to try is...", "One thing I learned was..."] : ["오늘 진행한 일은...", "다음으로 도전할 것은...", "오늘 새롭게 배운 것은..."])
            ).map(example=><button key={example} className="btn secondary" type="button"
              disabled={busy} onClick={()=>setBody(value=>value ? value+"\\n"+example : example)}>{example}</button>)}
          </div>
          {previews.length > 0 && <div className="composer-image-previews">
            {previews.map((preview, i) => <div key={preview.url} className="composer-image-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.url} alt={preview.name}/>
              <button type="button" onClick={() => setFiles((old) => old.filter((_, j) => i !== j))} disabled={busy} aria-label={`${preview.name} 삭제`}>×</button>
            </div>)}
          </div>}
          <label className="upload-image-button">＋ {t.addPhoto} <span>{files.length}/{MAX_IMAGES}</span>
            <input key={inputKey} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={addFiles} disabled={busy || files.length >= MAX_IMAGES}/>
          </label>
          <div className="composer-links">
            <label className="field compact-field">Goal <span className="optional">{t.optional}</span><select value={goalId} onChange={(e) => setGoalId(e.target.value)} disabled={busy}><option value="">{t.noLink}</option>{goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}</select></label>
            <label className="field compact-field">TEAM <span className="optional">{t.optional}</span><select value={teamId} onChange={(e) => { setTeamId(e.target.value); if (!e.target.value && visibility === "team") setVisibility("public"); }} disabled={busy}><option value="">{t.noLink}</option>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
          </div>
          <label className="field compact-field">{t.visibility}<select value={visibility} onChange={(e) => setVisibility(e.target.value)} disabled={busy}>
            <option value="public">{t.public}</option><option value="followers">{t.followers}</option>
            {teamId && <option value="team">{t.team}</option>}
            <option value="private">{t.private}</option>
          </select></label>
          <label className="field compact-field">{t.domain}<select value={domain} onChange={(e) => setDomain(e.target.value)} disabled={busy}>{domains.map((x) => <option key={x} value={x}>{x.toUpperCase()}</option>)}</select></label>
          {err && <div className="error notice" role="alert">{err}</div>}
          <div className="row composer-actions">
            <button className="btn secondary full" disabled={busy} onClick={() => setOpen(false)}>{messagesFor(locale).common.cancel}</button>
            <button className="btn primary full" onClick={submit} disabled={busy || (!body.trim() && !files.length)}>{busy ? t.upload : messagesFor(locale).common.post}</button>
          </div>
        </div>
      </div>}
    </>
  );
}
