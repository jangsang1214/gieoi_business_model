"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function NotificationOpenLink({ id, href, unread, children }: { id: string; href: string; unread: boolean; children: React.ReactNode }) {
  const router = useRouter();
  return <a href={href} className={`notification-row ${unread ? "unread" : ""}`} onClick={(event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    const supabase = createClient();
    void (async () => {
      if (unread) await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
      router.push(href);
      router.refresh();
    })();
  }}>{children}</a>;
}
