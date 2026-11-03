"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function StartDmButton({ me, target }: { me: string; target: string }) {
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

  return <button className="btn secondary" disabled={busy} onClick={start}>{busy ? "여는 중" : "메시지"}</button>;
}
