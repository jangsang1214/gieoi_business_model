export const opportunityKinds = [
  { value: "job", label: "채용 · 인턴" },
  { value: "team", label: "TEAM 모집" },
  { value: "collaboration", label: "협업" },
  { value: "project", label: "프로젝트" },
  { value: "audition", label: "오디션" },
  { value: "research", label: "연구" },
  { value: "investment", label: "투자" },
  { value: "other", label: "공모전 · 대외활동 등" },
] as const;

export const opportunityDomains = [
  { value: "business", label: "비즈니스" },
  { value: "workout", label: "운동" },
  { value: "create", label: "창작" },
  { value: "study", label: "공부" },
  { value: "career", label: "커리어" },
  { value: "lifestyle", label: "라이프" },
] as const;

export type OpportunityKind = (typeof opportunityKinds)[number]["value"];
export type OpportunityDomain = (typeof opportunityDomains)[number]["value"];

export function opportunityKindLabel(value: string): string {
  return opportunityKinds.find((entry) => entry.value === value)?.label ?? "기타 기회";
}

export function opportunityDomainLabel(value: string): string {
  return opportunityDomains.find((entry) => entry.value === value)?.label ?? "기타";
}

type DirectionSignals = {
  future_tags?: string[] | null;
  skill_tags?: string[] | null;
  preferred_domains?: string[] | null;
} | null;

type OpportunitySignals = {
  domain?: string | null;
  required_skills?: string[] | null;
  desired_future_tags?: string[] | null;
};

/**
 * Explanations use explicit shared interests only. An absent profile or
 * incomplete evidence must never be interpreted as a poor person-match.
 * Do not expose private direction fields to other users or public metadata.
 */
export function opportunityReasons(direction: DirectionSignals, opportunity: OpportunitySignals): string[] {
  if (!direction) return [];
  const norm = (value: string) => value.trim().toLowerCase();
  const matches = (mine: string[] | null | undefined, requested: string[] | null | undefined) => {
    const target = new Set((requested ?? []).map(norm));
    return (mine ?? []).filter((value) => target.has(norm(value)));
  };
  const reasons: string[] = [];
  const sharedSkills = matches(direction.skill_tags, opportunity.required_skills);
  if (sharedSkills.length) {
    reasons.push(`등록한 역량과 연결돼요 · ${sharedSkills.slice(0, 2).join(", ")}`);
  }
  if (matches(direction.future_tags, opportunity.desired_future_tags).length) {
    reasons.push("앞으로 가고 싶은 방향이 비슷해요");
  }
  if (opportunity.domain && (direction.preferred_domains ?? []).some(
    (domain) => norm(domain) === norm(opportunity.domain!)
  )) {
    reasons.push("관심 분야가 일치해요");
  }
  return reasons;
}
