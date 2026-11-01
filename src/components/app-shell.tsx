import Link from "next/link";
import { BottomNav, DesktopNav } from "./bottom-nav";
import { RecordComposer } from "./record-composer";

export function AppShell({ children, userId }: { children: React.ReactNode; userId: string }) {
  return (
    <div className="app-frame">
      <aside className="desktop-rail">
        <Link href="/" className="rail-brand" aria-label="기어이 홈">기어이.</Link>
        <DesktopNav />
        <p className="rail-note">Proof of Trajectory.<br />살아온 것이 당신을 보여주도록.</p>
      </aside>

      <div className="shell-main">
        <header className="appbar">
          <Link href="/" className="brand" aria-label="기어이 홈">기어이.</Link>
          <div className="appbar-actions">
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

      <aside className="desktop-context">
        <div className="context-card action-context">
          <div className="eyebrow">DISCOVER</div>
          <h4>같이 좋아하는 사람보다,<br />같이 갈 사람.</h4>
          <p>사람, TEAM, Goal과 Proof를 실제 궤적으로 탐색합니다.</p>
          <Link href="/explore" className="context-link">탐색하기 →</Link>
        </div>
        <div className="context-card action-context">
          <div className="eyebrow">OPPORTUNITY</div>
          <h4>살아온 것이<br />기회가 되도록.</h4>
          <p>당신의 Proof와 방향에 맞는 TEAM, 프로젝트와 기회를 확인합니다.</p>
          <Link href="/opportunity" className="context-link">기회 보기 →</Link>
        </div>
        <div className="context-foot">기어이 · Proof of Trajectory</div>
      </aside>
    </div>
  );
}
