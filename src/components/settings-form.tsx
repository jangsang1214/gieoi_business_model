"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SignOutButton } from "@/components/sign-out-button";
import { AvatarUploader } from "@/components/avatar-uploader";
import { messagesFor, type Locale } from "@/lib/i18n";

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

export function SettingsForm({ profile, email, locale = "ko" }: { profile: Profile; email: string; locale?: Locale }) {
  const t = messagesFor(locale).settings;
  const common = messagesFor(locale).common;
  const en = locale === "en";
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
      setMessage(t.nameRequired);
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
      setMessage(t.success);
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
          <h2>{profile.display_name || t.missingName}</h2>
          <p>{email}</p>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-heading"><div><span>01</span><h3>{t.profile}</h3></div></div>
        <label className="field"><span>{t.name}</span><input name="display_name" defaultValue={profile.display_name ?? ""} placeholder={t.namePlaceholder} required maxLength={60} autoComplete="nickname" /></label>
        <label className="field"><span>{t.id}</span><div className="input-prefix"><b>@</b><input name="handle" defaultValue={profile.handle ?? ""} placeholder="yourname" /></div></label>
        <label className="field"><span>{t.headline}</span><input name="headline" defaultValue={profile.headline ?? ""} placeholder={t.headlinePlaceholder} maxLength={90} /></label>
        <label className="field"><span>{t.bio}</span><textarea name="bio" defaultValue={profile.bio ?? ""} rows={4} placeholder={t.bioPlaceholder} maxLength={280} /></label>
      </section>

      <section className="settings-card">
        <div className="settings-heading"><div><span>02</span><h3>{t.affiliation}</h3></div><p>{t.affiliationHelp}</p></div>
        <div className="settings-two-col">
          <label className="field"><span>{t.affiliationName}</span><input name="affiliation_name" defaultValue={profile.affiliation_name ?? ""} placeholder={t.affiliationPlaceholder} /></label>
          <label className="field"><span>{t.role}</span><input name="affiliation_role" defaultValue={profile.affiliation_role ?? ""} placeholder={t.rolePlaceholder} /></label>
        </div>
        <div className="setting-inline-row"><span>{t.visible}</span><button type="button" aria-label={t.visible} className={affiliationVisible ? "switch on" : "switch"} onClick={() => setAffiliationVisible((v) => !v)}><span /></button></div>
      </section>

      <section className="settings-card">
        <div className="settings-heading"><div><span>03</span><h3>{t.domains}</h3></div></div>
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
        <div><div className="settings-heading inline"><div><span>05</span><h3>{t.discoverable}</h3></div></div><p>{t.discoverableHelp}</p></div>
        <button type="button" aria-label={t.discoverable} className={discoverable ? "switch on" : "switch"} onClick={() => setDiscoverable((v) => !v)}><span /></button>
      </section>

      {message && <div role={saveSuccess ? "status" : "alert"} className={saveSuccess ? "success notice" : "error notice"}>{message}</div>}
      <button className="btn primary full settings-save" disabled={saving}>{saving ? common.saving : common.save}</button>

      <section className="settings-card account-card">
        <div className="settings-heading"><div><span>06</span><h3>{t.account}</h3></div></div>
        <div className="account-email"><span>EMAIL</span><b>{email}</b></div>
        <SignOutButton locale={locale} />
      </section>
    </form>
  );
}
