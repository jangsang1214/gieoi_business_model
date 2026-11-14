"use client";

import { useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n";

export function AccountPrivacyActions({ locale, pending }: { locale: Locale; pending: boolean }) {
  const en = locale === "en";
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletePending, setDeletePending] = useState(pending);
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function exportData() {
    if (exporting) return;
    setExportError("");
    setExporting(true);
    try {
      const response = await fetch("/api/account/export", { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) throw new Error("Export request failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      try {
        const link = document.createElement("a");
        link.href = url;
        link.download = "prof-my-data.json";
        document.body.append(link);
        link.click();
        link.remove();
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch {
      setExportError(en ? "Could not prepare your file. Try again." : "파일을 준비하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setExporting(false);
    }
  }

  async function requestDeletion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || deletePending || confirmation !== (en ? "DELETE" : "삭제 요청")) return;
    setSubmitting(true);
    setDeleteError("");
    try {
      const response = await fetch("/api/account/deletion-request", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "REQUEST_DELETION" }),
      });
      if (!response.ok) throw new Error("Deletion request failed");
      setDeletePending(true);
      setConfirmation("");
    } catch {
      setDeleteError(en ? "Could not send the deletion request. Try again." : "삭제 요청을 접수하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="privacy-actions">
    <section className="settings-card privacy-export-card">
      <h2>{en ? "Download my data" : "내 데이터 다운로드"}</h2>
      <p className="meta">{en
        ? "Download a JSON copy of your profile, Goals, records, Proof and selected activities. Includes up to 1,000 entries per category; not a complete record of all stored data or uploaded media files."
        : "프로필, Goal, 기록, Proof 및 일부 활동 데이터를 JSON으로 받습니다. 항목당 최대 1,000건이며 전체 보유 데이터나 원본 사진을 모두 포함하지는 않습니다."}</p>
      <button type="button" className="btn secondary" onClick={exportData} disabled={exporting}>
        {exporting ? (en ? "Preparing..." : "준비 중...") : (en ? "Download JSON" : "JSON 다운로드")}
      </button>
      {exportError && <p role="alert" className="error notice">{exportError}</p>}
    </section>
    <section className="settings-card privacy-deletion-card">
      <h2>{en ? "Request account deletion" : "계정 삭제 요청"}</h2>
      <p className="meta">{en
        ? "This sends a request for review; it does not immediately delete your account. TEAMs, applications and collaboration records may involve other people, so the processing scope must be confirmed before deletion."
        : "요청을 접수하는 기능이며 계정이 즉시 삭제되지는 않습니다. TEAM, 지원, 협업 기록에는 다른 사용자 데이터가 연결될 수 있어 처리 범위를 검토해야 합니다."}</p>
      {deletePending
        ? <p role="status" className="success notice">{en ? "Your deletion request is pending review." : "계정 삭제 요청이 접수되어 검토 대기 중입니다."}</p>
        : <form onSubmit={requestDeletion} className="privacy-deletion-form">
            <label className="field">{en ? 'Type "DELETE" to request deletion' : '요청하려면 "삭제 요청"을 입력하세요'}
              <input type="text" autoComplete="off" value={confirmation} disabled={submitting}
                onChange={e => setConfirmation(e.target.value)}
                placeholder={en ? "DELETE" : "삭제 요청"}/>
            </label>
            <button className="btn secondary" type="submit" disabled={submitting || confirmation !== (en ? "DELETE" : "삭제 요청")}>
              {submitting ? (en ? "Submitting..." : "접수 중...") : (en ? "Submit deletion request" : "계정 삭제 요청 접수")}
            </button>
          </form>}
      {deleteError && <p role="alert" className="error notice">{deleteError}</p>}
    </section>
  </div>;
}
