"use client";

export function FeedPrompt() {
  function open(type: "journey" | "proof") {
    window.dispatchEvent(new CustomEvent("gieoi:compose", { detail: { type } }));
  }

  return (
    <section className="feed-prompt feed-prompt-v4">
      <button className="feed-prompt-main" onClick={() => open("journey")}>
        <span className="prompt-avatar">나</span>
        <span className="prompt-copy"><b>기록하기</b><small>지금 하고 있는 것을 남겨보세요.</small></span>
        <span className="prompt-plus">＋</span>
      </button>
      <button className="proof-quick" onClick={() => open("proof")}>Proof로 남기기</button>
    </section>
  );
}
