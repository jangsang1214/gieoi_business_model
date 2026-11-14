"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function SignOutButton({ locale = "ko" }: { locale?: Locale }) {
  const router = useRouter();
  return (
    <button
      className="btn danger full"
      onClick={async () => {
        await createClient().auth.signOut();
        router.replace("/login");
        router.refresh();
      }}
    >
      {locale === "en" ? "Sign out" : "로그아웃"}
    </button>
  );
}
