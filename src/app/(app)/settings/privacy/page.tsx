import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n-server";
import { AccountPrivacyActions } from "@/components/account-privacy-actions";

export default async function PrivacySettings() {
  const { supabase, userId } = await requireUser();
  const locale = await getLocale();
  const en = locale === "en";
  const { data: pending, error } = await supabase.from("account_deletion_requests")
    .select("id").eq("user_id", userId).eq("status", "pending").limit(1).maybeSingle();

  return <>
    <header className="utility-head">
      <div><Link href="/settings" className="meta">← {en ? "Settings" : "설정"}</Link>
        <h1>{en ? "Privacy & account data" : "개인정보 및 계정 데이터"}</h1>
        <p>{en ? "Review and manage information you have provided to prof." : "prof.에 기록한 데이터를 관리할 수 있어요."}</p>
      </div>
    </header>
    <AccountPrivacyActions locale={locale} pending={Boolean(pending)}/>
    {error && <p className="meta">{en ? "Deletion request status is temporarily unavailable." : "현재 계정 삭제 요청 상태를 확인할 수 없습니다."}</p>}
  </>;
}
