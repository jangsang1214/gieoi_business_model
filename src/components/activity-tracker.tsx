"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type EventKind = "impression" | "record_open" | "profile_view" | "team_view" | "proof_view" | "recommendation_save";
type Target = "record" | "profile" | "team" | "proof" | "goal" | "conversation";

export async function trackActivity(userId: string, eventType: EventKind, targetKind: Target, targetId: string, source = "app") {
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(targetId)) return;
  const supabase = createClient();
  // Telemetry is best-effort; UX must not depend on logging availability.
  await supabase.from("activity_events").insert({ user_id: userId, event_type: eventType, target_kind: targetKind, target_id: targetId, source });
}

export function ActivityViewTracker({ userId, type, id, source = "detail" }: { userId: string; type: "record_open" | "profile_view" | "team_view" | "proof_view"; id: string; source?: string }) {
  useEffect(() => { void trackActivity(userId, type, (type === "record_open" ? "record" : type.replace("_view", "")) as Target, id, source); }, [userId, type, id, source]);
  return null;
}

export function DiscoveryTracker({ userId }: { userId: string }) {
  useEffect(() => {
    const root = document.querySelector(".discovery-grid-v8");
    if (!root || !("IntersectionObserver" in window)) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-discovery-id][data-discovery-kind]")).slice(0, 24);
    const seen = new Set<string>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const id = el.dataset.discoveryId || "";
        const kind = el.dataset.discoveryKind || "";
        const key = `${kind}:${id}`;
        if (!seen.has(key) && id && ["record", "proof", "goal", "team"].includes(kind)) {
          seen.add(key);
          void trackActivity(userId, "impression", kind as Target, id, "explore");
        }
        observer.unobserve(el);
      }
    }, { threshold: 0.45 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [userId]);

  return null;
}
