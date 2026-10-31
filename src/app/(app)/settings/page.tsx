import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const { supabase, userId } = await requireUser();
  const [{ data: profile }, { data: authData }] = await Promise.all([
    supabase.from("profiles").select("id,display_name,handle,headline,bio,primary_domains,open_to,discoverable").eq("id", userId).single(),
    supabase.auth.getUser(),
  ]);

  if (!profile) return null;

  return (
    <>
      <section className="page-hero settings-hero">
        <div className="page-hero-top">
          <div>
            <div className="eyebrow">SETTINGS</div>
            <h1>당신이 보이는 방식도<br />당신이 정합니다.</h1>
          </div>
          <Link href="/profile" className="quiet-link">내 삶 보기</Link>
        </div>
        <p>프로필, 발견 범위, 관심 분야와 받고 싶은 기회를 한 곳에서 관리합니다.</p>
      </section>
      <SettingsForm profile={profile} email={authData.user?.email ?? ""} />
    </>
  );
}
