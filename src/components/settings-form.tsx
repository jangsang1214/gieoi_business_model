"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SignOutButton } from "@/components/sign-out-button";
import { AvatarUploader } from "@/components/avatar-uploader";

const domains = [
  ["business", "BUSINESS"],
  ["workout", "WORKOUT"],
  ["create", "CREATE"],
  ["study", "STUDY"],
  ["career", "CAREER"],
  ["lifestyle", "LIFESTYLE"],
] as const;

const openToOptions = [
  ["team", "TEAM"],
  ["project", "PROJECT"],
  ["competition", "COMPETITION"],
  ["collaboration", "COLLAB"],
  ["research", "RESEARCH"],
  ["job", "JOB"],
  ["investment", "INVESTMENT"],
] as const;

type Profile = {
  id: string;
  avatar_url: string | null;
  display_name: string | null;
  handle: string | null;
  headline: string | null;
  bio: string | null;
  primary_domains: string[] | null;
  open_to: string[] | null;
  discoverable: boolean | null;
  affiliation_name: string | null;
  affiliation_role: string | null;
  affiliation_visible: boolean | null;
};

export function SettingsForm({ profile, email }: { profile: Profile; email: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [domainsValue, setDomainsValue] = useState<string[]>(profile.primary_domains ?? []);
  const [openTo, setOpenTo] = useState<string[]>(profile.open_to ?? []);
  const [discoverable, setDiscoverable] = useState(profile.discoverable ?? true);
  const [affiliationVisible, setAffiliationVisible] = useState(profile.affiliation_visible ?? true);


  function toggle(list: string[], value: string, setter: (next: string[]) => void) {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setSaveSuccess(false);
    const form = new FormData(e.currentTarget);
    const displayName = String(form.get("display_name") ?? "").trim();
    if (!displayName) {
      setMessage("이름을 입력해 주세요.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const handle = String(form.get("handle") || "").trim().replace(/^@/, "").toLowerCase();

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        handle: handle || null,
        headline: String(form.get("headline") || "").trim() || null,
        bio: String(form.get("bio") || "").trim() || null,
        affiliation_name: String(form.get("affiliation_name") || "").trim() || null,
        affiliation_role: String(form.get("affiliation_role") || "").trim() || null,
        affiliation_visible: affiliationVisible,
        primary_domains: domainsValue,
        open_to: openTo,
        discoverable,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) setMessage(error.message);
    else {
      setMessage("변경사항을 저장했습니다.");
      setSaveSuccess(true);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="settings-stack">
      <section className="settings-card identity-card">
        <AvatarUploader userId={profile.id} name={profile.display_name||email} initialPath={profile.avatar_url}/>
        <div className="grow">
          <div className="eyebrow">PROFILE</div>
          <h2>{profile.display_name || "이름을 남겨주세요"}</h2>
          <p>{email}</p>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-heading"><div><span>01</span><h3>프로필</h3></div></div>
        <label className="field"><span>이름</span><input name="display_name" defaultValue={profile.display_name ?? ""} placeholder="당신의 이름" required maxLength={60} autoComplete="nickname" /></label>
        <label className="field"><span>아이디</span><div className="input-prefix"><b>@</b><input name="handle" defaultValue={profile.handle ?? ""} placeholder="yourname" /></div></label>
        <label className="field"><span>한 줄 소개</span><input name="headline" defaultValue={profile.headline ?? ""} placeholder="지금 무엇을 하고 있나요?" maxLength={90} /></label>
        <label className="field"><span>소개</span><textarea name="bio" defaultValue={profile.bio ?? ""} rows={4} placeholder="필요한 만큼만 적어주세요." maxLength={280} /></label>
      </section>

      <section className="settings-card">
        <div className="settings-heading"><div><span>02</span><h3>현재 소속</h3></div><p>회사, 학교, 연구실 등. 선택 사항입니다.</p></div>
        <div className="settings-two-col">
          <label className="field"><span>소속</span><input name="affiliation_name" defaultValue={profile.affiliation_name ?? ""} placeholder="예: NAVER, 한동대학교" /></label>
          <label className="field"><span>역할</span><input name="affiliation_role" defaultValue={profile.affiliation_role ?? ""} placeholder="예: Backend Engineer" /></label>
        </div>
        <div className="setting-inline-row"><span>프로필에 표시</span><button type="button" aria-label="현재 소속 표시" className={affiliationVisible ? "switch on" : "switch"} onClick={() => setAffiliationVisible((v) => !v)}><span /></button></div>
      </section>

      <section className="settings-card">
        <div className="settings-heading"><div><span>03</span><h3>나의 분야</h3></div></div>
        <div className="choice-grid">
          {domains.map(([value, label]) => (
            <button key={value} type="button" className={domainsValue.includes(value) ? "choice active" : "choice"} onClick={() => toggle(domainsValue, value, setDomainsValue)}>{label}</button>
          ))}
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-heading"><div><span>04</span><h3>Open to</h3></div></div>
        <div className="choice-grid compact">
          {openToOptions.map(([value, label]) => (
            <button key={value} type="button" className={openTo.includes(value) ? "choice active" : "choice"} onClick={() => toggle(openTo, value, setOpenTo)}>{label}</button>
          ))}
        </div>
      </section>

      <section className="settings-card setting-row-card">
        <div><div className="settings-heading inline"><div><span>05</span><h3>발견 허용</h3></div></div><p>꺼두면 탐색과 Scout에 노출되지 않습니다.</p></div>
        <button type="button" aria-label="발견 허용" className={discoverable ? "switch on" : "switch"} onClick={() => setDiscoverable((v) => !v)}><span /></button>
      </section>

      {message && <div role={saveSuccess ? "status" : "alert"} className={saveSuccess ? "success notice" : "error notice"}>{message}</div>}
      <button className="btn primary full settings-save" disabled={saving}>{saving ? "저장 중..." : "변경사항 저장"}</button>

      <section className="settings-card account-card">
        <div className="settings-heading"><div><span>06</span><h3>계정</h3></div></div>
        <div className="account-email"><span>EMAIL</span><b>{email}</b></div>
        <SignOutButton />
      </section>
    </form>
  );
}
