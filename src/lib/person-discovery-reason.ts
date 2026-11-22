/**
 * Discovery explanations must be backed by visible profile signals.
 * This intentionally does not invent a compatibility percentage.
 */
export function personDiscoveryReason(
  viewerDomains: readonly string[],
  candidateDomains: readonly string[],
  followed: boolean,
  locale: "ko" | "en",
): string {
  const viewer = new Set(viewerDomains.map(value => value.toLowerCase()));
  const candidate = [...new Set(candidateDomains.map(value => value.toLowerCase()).filter(Boolean))];
  const shared = candidate.find(value => viewer.has(value));

  if (shared) {
    return locale === "en" ? `Shared interest · ${shared.toUpperCase()}` : `공통 관심 분야 · ${shared.toUpperCase()}`;
  }
  if (followed) return locale === "en" ? "You're following" : "팔로우 중";
  if (candidate.length) {
    return locale === "en" ? `Interested in ${candidate[0].toUpperCase()}` : `관심 분야 · ${candidate[0].toUpperCase()}`;
  }
  return locale === "en" ? "Discover a person" : "새로운 사람";
}
