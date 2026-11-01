"use client";

const recordTypes = [
  ["life", "LIFE", "오늘의 장면"],
  ["journey", "JOURNEY", "과정 남기기"],
  ["proof", "PROOF", "결과 증명"],
] as const;

export function FeedPrompt() {
  function open(type: string) {
    window.dispatchEvent(new CustomEvent("gieoi:compose", { detail: { type } }));
  }

  return (
    <section className="feed-prompt">
      <button className="feed-prompt-main" onClick={() => open("life")}>
        <span className="prompt-avatar">나</span>
        <span className="prompt-copy"><b>오늘은 어떤 하루를 남겼나요?</b><small>작은 기록도 당신의 궤적이 됩니다.</small></span>
        <span className="prompt-plus">＋</span>
      </button>
      <div className="prompt-types">
        {recordTypes.map(([type, label, desc]) => <button key={type} onClick={() => open(type)}><b>{label}</b><span>{desc}</span></button>)}
      </div>
    </section>
  );
}
