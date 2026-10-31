import Link from "next/link";
import { BottomNav } from "./bottom-nav";
import { RecordComposer } from "./record-composer";

export function AppShell({ children, userId }: { children: React.ReactNode; userId: string }) {
  return (
    <div className="app-frame">
      <header className="appbar">
        <Link href="/" className="brand" aria-label="기어이 홈">기어이.</Link>
        <div className="appbar-actions">
          <Link href="/messages" className="icon-btn" aria-label="메시지">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14v10H9l-4 3v-13Z" /></svg>
          </Link>
          <Link href="/settings" className="icon-btn" aria-label="설정">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="M19 12a7 7 0 0 0-.08-1l2-1.55-2-3.46-2.46.99a7 7 0 0 0-1.72-1L14.4 3h-4.8l-.34 2.98a7 7 0 0 0-1.72 1L5.08 6l-2 3.46L5.08 11A7 7 0 0 0 5 12c0 .34.03.68.08 1l-2 1.55 2 3.46 2.46-.99a7 7 0 0 0 1.72 1L9.6 21h4.8l.34-2.98a7 7 0 0 0 1.72-1l2.46.99 2-3.46L18.92 13c.05-.32.08-.66.08-1Z"/></svg>
          </Link>
        </div>
      </header>
      <main className="page">{children}</main>
      <RecordComposer userId={userId} />
      <BottomNav />
    </div>
  );
}
