import Link from "next/link";
import { BottomNav, DesktopNav } from "./bottom-nav";
import { RecordComposer } from "./record-composer";
import { NotificationRealtime } from "./notification-realtime";
import { LocaleSwitcher } from "./locale-switcher";
import { messagesFor, type Locale } from "@/lib/i18n";

export function AppShell({ children, userId, unreadCount = 0, locale }: { children: React.ReactNode; userId: string; unreadCount?: number; locale: Locale }) {
  const t = messagesFor(locale);
  return (
    <div className="app-frame">
      <NotificationRealtime userId={userId} />
      <aside className="desktop-rail">
        <Link href="/" className="rail-brand" aria-label={`prof. ${t.nav.home}`}>prof.</Link>
        <DesktopNav locale={locale} />
        <LocaleSwitcher locale={locale} compact />
        <p className="rail-note">Proof of Trajectory.<br />{t.nav.note}</p>
      </aside>

      <div className="shell-main">
        <header className="appbar">
          <Link href="/" className="brand" aria-label="prof. 홈">prof.</Link>
          <div className="appbar-actions">
            <LocaleSwitcher locale={locale} compact />
            <Link href="/notifications" className="icon-btn notification-icon-link" aria-label={unreadCount ? `${t.nav.notifications} ${unreadCount}` : t.nav.notifications}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9ZM10 21h4"/></svg>
              {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? "9+" : unreadCount}</span>}
            </Link>
            <Link href="/explore" className="icon-btn" aria-label={t.nav.explore}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.2 4.2"/></svg>
            </Link>
            <Link href="/messages" className="icon-btn" aria-label={t.nav.messages}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14v10H9l-4 3v-13Z" /></svg>
            </Link>
          </div>
        </header>
        <main className="page">{children}</main>
        <RecordComposer userId={userId} locale={locale} />
        <BottomNav locale={locale} />
      </div>


    </div>
  );
}
