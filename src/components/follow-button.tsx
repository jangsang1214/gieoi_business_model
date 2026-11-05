"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function FollowButton({ me, target, initiallyFollowing = false }: { me: string; target: string; initiallyFollowing?: boolean }) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function toggle() {
    if (busy || me === target) return;
    setBusy(true);
    setError("");
    const supabase = createClient();
    const operation = following
      ? supabase.from("follows").delete().eq("follower_id", me).eq("following_id", target)
      : supabase.from("follows").insert({ follower_id: me, following_id: target });
    const { error: dbError } = await operation;
    if (dbError) setError("팔로우 상태를 변경하지 못했습니다. 다시 시도해 주세요.");
    else {
      setFollowing(!following);
      router.refresh();
    }
    setBusy(false);
  }

  return <div className="follow-action">
    <button className={`btn ${following ? "secondary" : "primary"}`} type="button" disabled={busy} onClick={toggle} aria-pressed={following}>
      {busy ? "처리 중..." : following ? "팔로잉 ✓" : "팔로우"}
    </button>
    {error && <div role="alert" className="error compact-notice">{error}</div>}
  </div>;
}
