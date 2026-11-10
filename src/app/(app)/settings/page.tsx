import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { SettingsForm } from "@/components/settings-form";
import { UnblockUserButton } from "@/components/block-user-button";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { getLocale } from "@/lib/i18n-server";
import { messagesFor } from "@/lib/i18n";

export default async function SettingsPage() {
  const { supabase, userId } = await requireUser();
  const locale = await getLocale();
  const t = messagesFor(locale);
  const [{ data: profile }, { data: authData }, { data: blocked }] = await Promise.all([
    supabase.from("profiles").select("id,display_name,handle,headline,bio,avatar_url,primary_domains,open_to,discoverable,affiliation_name,affiliation_role,affiliation_visible").eq("id", userId).single(),
    supabase.auth.getUser(),
    supabase.from("blocks").select("blocked_id").eq("blocker_id",userId),
  ]);

  if (!profile) return null;

  return (
    <>
      <header className="utility-head settings-head-v4">
        <div><h1>{t.settings.title}</h1><p>{t.settings.subtitle}</p></div>
        <Link href="/profile" className="quiet-link">{t.settings.viewProfile}</Link>
      </header>
      <section className="settings-card language-settings-card"><LocaleSwitcher locale={locale}/></section>
      <SettingsForm profile={profile} email={authData.user?.email ?? ""} locale={locale} />
      <section className="settings-card blocked-users-v15">
        <div className="settings-heading"><div><span>SAFETY</span><h3>{t.settings.blocked}</h3></div></div>
        {blocked?.length ? blocked.map((item)=> <div className="blocked-user-row" key={item.blocked_id}>
          <span>{locale === "en" ? "Blocked account" : "차단된 계정"} · {String(item.blocked_id).slice(0,8)}</span>
          <UnblockUserButton userId={userId} targetId={item.blocked_id}/>
        </div>) : <p className="meta">{t.settings.noneBlocked}</p>}
      </section>
    </>
  );
}
