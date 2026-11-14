"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

export function StartDmButton({ me, target, locale = "ko" }: { me: string; target: string; locale?: Locale }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function start() {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("kind", "dm")
      .contains("participant_ids", [me, target])
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      setBusy(false);
      router.push(`/messages/${existing.id}`);
      return;
    }

    const { data } = await supabase
      .from("conversations")
      .insert({ kind: "dm", participant_ids: [me, target].sort(), created_by: me })
      .select("id")
      .single();

    setBusy(false);
    if (data?.id) router.push(`/messages/${data.id}`);
  }

  return <button className="btn secondary" disabled={busy} onClick={start}>{busy ? (locale === "en" ? "Opening..." : "여는 중") : (locale === "en" ? "Message" : "메시지")}</button>;
}
