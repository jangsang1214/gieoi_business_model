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
  if (name === "home") return <svg viewBox="0 0 24 24"><path d="M3.8 10.5 12 3.6l8.2 6.9v9H15v-5.1H9v5.1H3.8z"/></svg>;
  if (name === "team") return <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3.5 19c.4-4 2.6-6 5.5-6s5.1 2 5.5 6M14 14c3.5 0 5.4 1.8 5.8 5"/></svg>;
  if (name === "opportunity") return <svg viewBox="0 0 24 24"><path d="M5.2 18.8 18.8 5.2M9.2 5.2h9.6v9.6"/></svg>;
  if (name === "message") return <svg viewBox="0 0 24 24"><path d="M4 5.5h16v11H9l-5 3z"/></svg>;
  return <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.4-4.5 2.8-7 6.5-7s6.1 2.5 6.5 7"/></svg>;
}

function ActiveLink({ href, label, icon, compact = false }: { href: string; label: string; icon: string; compact?: boolean }) {
  const path = usePathname();
  const active = href === "/" ? path === "/" : path.startsWith(href);
  return (
    <Link href={href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
      <span className="nav-icon"><NavIcon name={icon} /></span>
      {!compact && <span>{label}</span>}
    </Link>
  );
}

export function DesktopNav() {
  const path = usePathname();
  return (
    <>
      <nav className="rail-nav" aria-label="주요 메뉴">
        {items.map(([href, label, icon]) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return <Link key={href} href={href} className={active ? "active" : ""}><span className="nav-icon"><NavIcon name={icon} /></span><span>{label}</span></Link>;
        })}
      </nav>
      <div className="rail-bottom">
        <Link href="/settings" className={path.startsWith("/settings") ? "active" : ""}>
          <span className="nav-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M19 12a7 7 0 0 0-.08-1l2-1.55-2-3.46-2.46.99a7 7 0 0 0-1.72-1L14.4 3h-4.8l-.34 2.98a7 7 0 0 0-1.72 1L5.08 6l-2 3.46L5.08 11A7 7 0 0 0 5 12c0 .34.03.68.08 1l-2 1.55 2 3.46 2.46-.99a7 7 0 0 0 1.72 1L9.6 21h4.8l.34-2.98a7 7 0 0 0 1.72-1l2.46.99 2-3.46L18.92 13c.05-.32.08-.66.08-1Z"/></svg></span>
          <span>설정</span>
        </Link>
      </div>
    </>
  );
}

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      {items.map(([href, label, icon]) => <ActiveLink key={href} href={href} label={label} icon={icon} />)}
    </nav>
  );
}
