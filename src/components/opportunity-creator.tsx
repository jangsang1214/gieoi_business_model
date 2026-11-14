"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { opportunityKinds, opportunityDomains, opportunityKindLabel, opportunityDomainLabel } from "@/lib/opportunity";
import { messagesFor, type Locale } from "@/lib/i18n";

function parseTags(input: string): string[] {
  return [...new Set(input.split(",").map((value) => value.trim()).filter(Boolean))].slice(0, 8);
}

export function OpportunityCreator({ userId, locale = "ko" }: { userId: string; locale?: Locale }) {
  const t = messagesFor(locale).opportunity;
  const en = locale === "en";
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const fd = new FormData(event.currentTarget);
    const organization = String(fd.get("org") ?? "").trim();
    const title = String(fd.get("title") ?? "").trim();
    const description = String(fd.get("description") ?? "").trim();
    const kind = String(fd.get("kind") ?? "");
    const domain = String(fd.get("domain") ?? "");

    if (!organization || !title || !description
      || !opportunityKinds.some((entry) => entry.value === kind)
      || !opportunityDomains.some((entry) => entry.value === domain)) {
      setError(en ? "Please complete all required fields." : "필수 내용을 확인해 주세요.");
      return;
    }
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error: insertError } = await supabase.from("opportunities").insert({
      created_by: userId,
      organization_name: organization.slice(0, 100),
      title: title.slice(0, 120),
      description: description.slice(0, 3000),
      kind,
      domain,
      status: "open",
      required_skills: parseTags(String(fd.get("skills") ?? "")),
      desired_future_tags: parseTags(String(fd.get("direction") ?? "")),
    });
    setBusy(false);
    if (insertError) {
      setError(en ? "Could not post this opportunity. Check your details and try again." : "기회를 등록하지 못했어요. 내용을 확인하고 다시 시도해 주세요.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return <>
    <button type="button" className="btn primary" onClick={() => {
      setError("");
      setOpen(true);
    }}>{t.publish}</button>
    {open && <div className="overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) setOpen(false);
    }}>
      <form className="sheet" onSubmit={submit}>
        <div className="grab" />
        <h2>{en ? "Post a new opportunity" : "새 기회 등록"}</h2>
        <p className="meta">{en ? "Find collaborators or share a project, role, or competition." : "함께할 사람을 찾거나 프로젝트, 채용, 공모전 등 새로운 기회를 공유하세요."}</p>
        <label className="field"><span>{en ? "Organizer / organization / TEAM" : "게시자 / 조직 / TEAM"}</span>
          <input name="org" required maxLength={100} placeholder={en ? "e.g. Design study group" : "예: 디자인 스터디, OO 동아리"} disabled={busy}/>
        </label>
        <label className="field"><span>{en ? "Opportunity title" : "기회 제목"}</span>
          <input name="title" required maxLength={120} placeholder={en ? "Who are you looking for?" : "어떤 사람을 찾고 있나요?"} disabled={busy}/>
        </label>
        <label className="field"><span>{t.kind}</span>
          <select name="kind" defaultValue="project" disabled={busy}>
            {opportunityKinds.map((item) => <option value={item.value} key={item.value}>{opportunityKindLabel(item.value, locale)}</option>)}
          </select>
        </label>
        <label className="field"><span>{t.domain}</span>
          <select name="domain" defaultValue="business" disabled={busy}>
            {opportunityDomains.map((item) => <option value={item.value} key={item.value}>{opportunityDomainLabel(item.value, locale)}</option>)}
          </select>
        </label>
        <label className="field"><span>{en ? "Description" : "자세한 설명"}</span>
          <textarea name="description" required maxLength={3000} rows={5}
            placeholder={en ? "Describe the goals, roles, timeline and ways to get involved." : "목표, 필요한 역할, 활동 방식, 기간, 연락 방법 등을 알려 주세요."}
            disabled={busy}/>
        </label>
        <label className="field"><span>{en ? "Skills" : "필요 역량"} <small>{en ? "(optional, comma-separated)" : "(선택 · 쉼표로 구분)"}</small></span>
          <input name="skills" maxLength={250} placeholder={en ? "e.g. Engineering, design, editing" : "예: 개발, 디자인, 영상 편집"} disabled={busy}/>
        </label>
        <label className="field"><span>{en ? "Shared goals" : "관련 방향"} <small>{en ? "(optional, comma-separated)" : "(선택 · 쉼표로 구분)"}</small></span>
          <input name="direction" maxLength={250} placeholder={en ? "e.g. Launch an AI product" : "예: AI 제품 출시, 대회 출전"} disabled={busy}/>
        </label>
        <p className="meta">{en ? "Entering an organization name does not verify it. Misleading offers or requests for sensitive data are prohibited." : "조직명 입력은 기관 인증을 의미하지 않습니다. 허위 모집이나 민감정보 요구는 금지됩니다."}</p>
        {error && <div className="error notice" role="alert">{error}</div>}
        <div className="row">
          <button type="button" className="btn secondary full" disabled={busy} onClick={() => setOpen(false)}>{messagesFor(locale).common.cancel}</button>
          <button type="submit" className="btn primary full" disabled={busy}>{busy ? messagesFor(locale).common.posting : (en ? "Publish opportunity" : "기회 게시")}</button>
        </div>
      </form>
    </div>}
  </>;
}
