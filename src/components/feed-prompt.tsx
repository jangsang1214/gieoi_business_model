"use client";
import { messagesFor, type Locale } from "@/lib/i18n";

export function FeedPrompt({ locale }: { locale: Locale }) {
  const t = messagesFor(locale).home;
  function open(type: "journey" | "proof") {
    window.dispatchEvent(new CustomEvent("gieoi:compose", { detail: { type } }));
  }

  return (
    <section className="feed-prompt feed-prompt-v4">
      <button className="feed-prompt-main" onClick={() => open("journey")}>
        <span className="prompt-avatar">{locale === "ko" ? "나" : "Me"}</span>
        <span className="prompt-copy"><b>{t.write}</b><small>{t.writeHint}</small></span>
        <span className="prompt-plus">＋</span>
      </button>
      <button className="proof-quick" onClick={() => open("proof")}>{t.proof}</button>
    </section>
  );
}
