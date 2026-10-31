"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SignOutButton } from "@/components/sign-out-button";

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
  ["job", "JOB"],
  ["collaboration", "COLLAB"],
  ["project", "PROJECT"],
  ["research", "RESEARCH"],
  ["investment", "INVESTMENT"],
] as const;

type Profile = {
  id: string;
  display_name: string | null;
  handle: string | null;
  headline: string | null;
  bio: string | null;
  primary_domains: string[] | null;
  open_to: string[] | null;
  discoverable: boolean | null;
};

export function SettingsForm({ profile, email }: { profile: Profile; email: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [domainsValue, setDomainsValue] = useState<string[]>(profile.primary_domains ?? []);
  const [openTo, setOpenTo] = useState<string[]>(profile.open_to ?? []);
  const [discoverable, setDiscoverable] = useState(profile.discoverable ?? true);

  const initials = useMemo(() => (profile.display_name || email || "G").slice(0, 1).toUpperCase(), [profile.display_name, email]);

  function toggle(list: string[], value: string, setter: (next: string[]) => void) {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const handle = String(form.get("handle") || "").trim().replace(/^@/, "").toLowerCase();

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: String(form.get("display_name") || "").trim() || null,
        handle: handle || null,
        headline: String(form.get("headline") || "").trim() || null,
        bio: String(form.get("bio") || "").trim() || null,
        primary_domains: domainsValue,
        open_to: openTo,
        discoverable,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) setMessage(error.message);
    else {
      setMessage("변경사항을 저장했습니다.");
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="settings-stack">
      <section className="settings-card identity-card">
        <div className="settings-avatar">{initials}</div>
        <div className="grow">
          <div className="eyebrow">YOUR IDENTITY</div>
          <h2>{profile.display_name || "이름을 남겨주세요"}</h2>
          <p>{email}</p>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-heading">
          <div><span>01</span><h3>프로필</h3></div>
          <p>누군가 당신을 처음 발견했을 때 보게 되는 정보입니다.</p>
        </div>
        <label className="field"><span>이름</span><input name="display_name" defaultValue={profile.display_name ?? ""} placeholder="당신의 이름" /></label>
        <label className="field"><span>아이디</span><div className="input-prefix"><b>@</b><input name="handle" defaultValue={profile.handle ?? ""} placeholder="gieoi" /></div></label>
        <label className="field"><span>한 줄 소개</span><input name="headline" defaultValue={profile.headline ?? ""} placeholder="지금 무엇을 만들고 있나요?" maxLength={90} /></label>
        <label className="field"><span>소개</span><textarea name="bio" defaultValue={profile.bio ?? ""} rows={4} placeholder="당신이 어떤 삶을 살아가고 있는지 짧게 적어주세요." maxLength={280} /></label>
      </section>

      <section className="settings-card">
        <div className="settings-heading">
          <div><span>02</span><h3>나의 분야</h3></div>
          <p>피드와 사람 추천이 이 선택을 기준으로 조금 더 선명해집니다.</p>
        </div>
        <div className="choice-grid">
          {domains.map(([value, label]) => (
            <button key={value} type="button" className={domainsValue.includes(value) ? "choice active" : "choice"} onClick={() => toggle(domainsValue, value, setDomainsValue)}>{label}</button>
          ))}
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-heading">
          <div><span>03</span><h3>Open to</h3></div>
          <p>어떤 연결과 기회를 받고 싶은지 표시합니다.</p>
        </div>
        <div className="choice-grid compact">
          {openToOptions.map(([value, label]) => (
            <button key={value} type="button" className={openTo.includes(value) ? "choice active" : "choice"} onClick={() => toggle(openTo, value, setOpenTo)}>{label}</button>
          ))}
        </div>
      </section>

      <section className="settings-card setting-row-card">
        <div>
          <div className="settings-heading inline"><div><span>04</span><h3>발견 허용</h3></div></div>
          <p>꺼두면 다른 사용자의 탐색과 Scout에서 프로필이 노출되지 않습니다.</p>
        </div>
        <button type="button" aria-label="발견 허용" className={discoverable ? "switch on" : "switch"} onClick={() => setDiscoverable((v) => !v)}><span /></button>
      </section>

      {message && <div className={message.includes("저장") ? "success notice" : "error notice"}>{message}</div>}
      <button className="btn primary full settings-save" disabled={saving}>{saving ? "저장 중..." : "변경사항 저장"}</button>

      <section className="settings-card account-card">
        <div className="settings-heading"><div><span>05</span><h3>계정</h3></div><p>현재 로그인한 계정입니다.</p></div>
        <div className="account-email"><span>EMAIL</span><b>{email}</b></div>
        <SignOutButton />
      </section>
    </form>
  );
}
