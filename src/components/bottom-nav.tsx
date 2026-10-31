"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/", "홈", "home"],
  ["/team", "TEAM", "team"],
  ["/opportunity", "기회", "opportunity"],
  ["/messages", "메시지", "message"],
  ["/profile", "내 삶", "profile"],
] as const;

function NavIcon({ name }: { name: string }) {
  if (name === "home") return <svg viewBox="0 0 24 24"><path d="M3.5 10.4 12 3l8.5 7.4v9.1h-5.4v-5.4H8.9v5.4H3.5v-9.1Z"/></svg>;
  if (name === "team") return <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3.5 19c.4-4 2.6-6 5.5-6s5.1 2 5.5 6M14 14c3.5 0 5.4 1.8 5.8 5"/></svg>;
  if (name === "opportunity") return <svg viewBox="0 0 24 24"><path d="M5 19 19 5M9 5h10v10"/></svg>;
  if (name === "message") return <svg viewBox="0 0 24 24"><path d="M4 5.5h16v11H9l-5 3v-14Z"/></svg>;
  return <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.4-4.5 2.8-7 6.5-7s6.1 2.5 6.5 7"/></svg>;
}

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      {items.map(([href, label, icon]) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link key={href} href={href} className={active ? "active" : ""}>
            <span className="nav-icon"><NavIcon name={icon} /></span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
