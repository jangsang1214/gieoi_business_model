import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const { supabase, userId } = await requireUser();
  const [{ data: profile }, { data: authData }] = await Promise.all([
    supabase.from("profiles").select("id,display_name,handle,headline,bio,primary_domains,open_to,discoverable,affiliation_name,affiliation_role,affiliation_visible").eq("id", userId).single(),
    supabase.auth.getUser(),
  ]);

  if (!profile) return null;

  return (
    <>
      <header className="utility-head settings-head-v4">
        <div><h1>설정</h1><p>프로필과 연결 상태를 관리합니다.</p></div>
        <Link href="/profile" className="quiet-link">프로필 보기</Link>
      </header>
      <SettingsForm profile={profile} email={authData.user?.email ?? ""} />
    </>
  );
}
