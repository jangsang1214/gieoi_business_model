import Link from "next/link";
import { BottomNav, DesktopNav } from "./bottom-nav";
import { RecordComposer } from "./record-composer";

export function AppShell({ children, userId }: { children: React.ReactNode; userId: string }) {
  return (
    <div className="app-frame">
      <aside className="desktop-rail">
        <Link href="/" className="rail-brand" aria-label="기어이 홈">기어이.</Link>
        <DesktopNav />
        <div className="rail-spacer" />
        <p className="rail-note">Proof of Trajectory.<br />살아온 것이 당신을 보여주도록.</p>
      </aside>

      <div className="shell-main">
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

      <aside className="desktop-context">
        <div className="context-card">
          <div className="eyebrow">TODAY&apos;S QUESTION</div>
          <h4>오늘은 어떤 하루를 남겼나요?</h4>
          <p>작은 행동도 반복되면 방향이 되고, 방향은 결국 당신의 궤적이 됩니다.</p>
          <Link href="/profile" className="context-link">내 궤적 보기 →</Link>
        </div>
        <div className="context-card">
          <div className="eyebrow">GIEOI</div>
          <p className="context-quote">“기술은 대신할 수 있어도, 삶은 대신 살아줄 수 없다.”</p>
        </div>
        <div className="context-foot">기어이, 우리가 꿈꾸던 곳까지.</div>
      </aside>
    </div>
  );
}
