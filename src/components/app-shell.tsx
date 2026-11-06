import Link from "next/link";
import { BottomNav, DesktopNav } from "./bottom-nav";
import { RecordComposer } from "./record-composer";
import { NotificationRealtime } from "./notification-realtime";

export function AppShell({ children, userId, unreadCount = 0 }: { children: React.ReactNode; userId: string; unreadCount?: number }) {
  return (
    <div className="app-frame">
      <NotificationRealtime userId={userId} />
      <aside className="desktop-rail">
        <Link href="/" className="rail-brand" aria-label="기어이 홈">기어이.</Link>
        <DesktopNav />
        <p className="rail-note">Proof of Trajectory.<br />살아온 것이 당신을 보여주도록.</p>
      </aside>

      <div className="shell-main">
        <header className="appbar">
          <Link href="/" className="brand" aria-label="기어이 홈">기어이.</Link>
          <div className="appbar-actions">
            <Link href="/notifications" className="icon-btn notification-icon-link" aria-label={unreadCount ? `알림 ${unreadCount}개` : "알림"}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9ZM10 21h4"/></svg>
              {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? "9+" : unreadCount}</span>}
            </Link>
            <Link href="/explore" className="icon-btn" aria-label="탐색">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.2 4.2"/></svg>
            </Link>
            <Link href="/messages" className="icon-btn" aria-label="메시지">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14v10H9l-4 3v-13Z" /></svg>
            </Link>
          </div>
        </header>
        <main className="page">{children}</main>
        <RecordComposer userId={userId} />
        <BottomNav />
      </div>


    </div>
  );
}
