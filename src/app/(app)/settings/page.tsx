import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { SettingsForm } from "@/components/settings-form";
import { UnblockUserButton } from "@/components/block-user-button";

export default async function SettingsPage() {
  const { supabase, userId } = await requireUser();
  const [{ data: profile }, { data: authData }, { data: blocked }] = await Promise.all([
    supabase.from("profiles").select("id,display_name,handle,headline,bio,primary_domains,open_to,discoverable,affiliation_name,affiliation_role,affiliation_visible").eq("id", userId).single(),
    supabase.auth.getUser(),
    supabase.from("blocks").select("blocked_id").eq("blocker_id",userId),
  ]);

  if (!profile) return null;

  return (
    <>
      <header className="utility-head settings-head-v4">
        <div><h1>설정</h1><p>프로필과 연결 상태를 관리합니다.</p></div>
        <Link href="/profile" className="quiet-link">프로필 보기</Link>
      </header>
      <SettingsForm profile={profile} email={authData.user?.email ?? ""} />
      <section className="settings-card blocked-users-v15">
        <div className="settings-heading"><div><span>SAFETY</span><h3>차단한 사용자</h3></div></div>
        {blocked?.length ? blocked.map((item)=> <div className="blocked-user-row" key={item.blocked_id}>
          <span>차단된 계정 · {String(item.blocked_id).slice(0,8)}</span>
          <UnblockUserButton userId={userId} targetId={item.blocked_id}/>
        </div>) : <p className="meta">차단한 사용자가 없습니다.</p>}
      </section>
    </>
  );
}
