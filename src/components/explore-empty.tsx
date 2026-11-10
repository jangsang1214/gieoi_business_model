"use client";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export function ExploreEmpty({ searched, locale = "ko" }: { searched: boolean; locale?: Locale }) {
  const en = locale === "en";
  return <section className="explore-empty-v16">
    <span className="mini-label">{searched ? "NO RESULTS" : "START HERE"}</span>
    <h2>{searched ? (en ? "No matching results." : "일치하는 결과가 없어요.") : (en ? "No records to discover yet." : "아직 발견할 기록이 없어요.")}</h2>
    <p>{searched
      ? (en ? "Try a different search or invite someone to prof." : "검색어나 필터를 바꿔보세요. 관심 있는 사람을 먼저 초대해도 좋아요.")
      : (en ? "Share your first update or invite a friend to get started." : "첫 기록을 남기거나, 함께할 사람을 초대해 프로프의 첫 연결을 시작해 보세요.")}</p>
    <div className="explore-empty-actions-v16">
      <button type="button" className="btn primary" onClick={() => window.dispatchEvent(new CustomEvent("gieoi:compose",{detail:{type:"journey"}}))}>
        {en ? "Add first update" : "첫 기록 남기기"}
      </button>
      <Link className="btn secondary" href="/team">{en ? "Browse TEAMs" : "TEAM 둘러보기"}</Link>
    </div>
  </section>;
}
