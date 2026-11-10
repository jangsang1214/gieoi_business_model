"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { messagesFor, type Locale } from "@/lib/i18n";

export function LocaleSwitcher({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Locale>(locale);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const t = messagesFor(locale);

  // Keep all switches in sync when another language control refreshes the layout.
  useEffect(() => { setSelected(locale); }, [locale]);

  async function change(next: Locale) {
    if (busy || next === selected) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/locale", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      if (!response.ok) throw new Error("Locale update failed");
      setSelected(next);
      document.documentElement.lang = next;
      router.refresh();
    } catch {
      setError(t.language.failed);
    } finally {
      setBusy(false);
    }
  }

  return <div className={compact ? "locale-switcher compact" : "locale-switcher"} aria-label={t.language.title}>
    {!compact && <div className="locale-description">
      <strong>{t.language.title}</strong>
      <p>{t.language.help}</p>
    </div>}
    <div className="locale-options" role="group" aria-label={t.language.select}>
      <button type="button" disabled={busy} onClick={() => change("ko")}
        aria-pressed={selected === "ko"} className={selected === "ko" ? "active" : ""}>한국어</button>
      <button type="button" disabled={busy} onClick={() => change("en")}
        aria-pressed={selected === "en"} className={selected === "en" ? "active" : ""}>EN</button>
    </div>
    {error && <span role="alert" className="error">{error}</span>}
  </div>;
}
