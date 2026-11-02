"use client";

export function ComposeLinkButton({ goalId, teamId, proof = false, label }: { goalId?: string; teamId?: string; proof?: boolean; label: string }) {
  return <button className="btn secondary" type="button" onClick={() => {
    window.dispatchEvent(new CustomEvent("gieoi:compose", { detail: { type: proof ? "proof" : "journey", goalId, teamId } }));
  }}>{label}</button>;
}
