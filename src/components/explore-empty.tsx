"use client";
import Link from "next/link";

export function ExploreEmpty({ searched }: { searched: boolean }) {
  return <section className="explore-empty-v16">
    <span className="mini-label">{searched ? "NO RESULTS" : "START HERE"}</span>
    <h2>{searched ? "일치하는 결과가 없어요." : "아직 발견할 기록이 없어요."}</h2>
    <p>{searched
      ? "검색어나 필터를 바꿔보세요. 관심 있는 사람을 먼저 초대해도 좋아요."
      : "첫 기록을 남기거나, 함께할 사람을 초대해 기어이의 첫 연결을 시작해 보세요."}</p>
    <div className="explore-empty-actions-v16">
      <button type="button" className="btn primary" onClick={() => window.dispatchEvent(new CustomEvent("gieoi:compose",{detail:{type:"journey"}}))}>
        첫 기록 남기기
      </button>
      <Link className="btn secondary" href="/team">TEAM 둘러보기</Link>
    </div>
  </section>;
}
