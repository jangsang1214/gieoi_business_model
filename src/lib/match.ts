type Direction = {
  future_tags?: string[] | null;
  skill_tags?: string[] | null;
  desired_complements?: string[] | null;
  preferred_domains?: string[] | null;
  weekly_commitment_hours?: number | null;
  active_weeks_12?: number | null;
  team_continuity_months?: number | null;
  evidence_count?: number | null;
  verified_evidence_count?: number | null;
  stage?: string | null;
};

type TeamDirection = {
  future_tags?: string[] | null;
  skill_tags?: string[] | null;
  needed_skills?: string[] | null;
  weekly_commitment_hours?: number | null;
  proof_count?: number | null;
  verified_proof_count?: number | null;
};

type Opportunity = {
  domain?: string | null;
  desired_future_tags?: string[] | null;
  required_skills?: string[] | null;
  desired_stage?: string | null;
  minimum_verified_proofs?: number | null;
  minimum_team_months?: number | null;
};

type PersonSignal = {
  direction?: Direction | null;
  domains?: string[] | null;
  openTo?: string[] | null;
  goalDomains?: string[] | null;
  proofCount?: number | null;
  verifiedProofCount?: number | null;
  recentRecords?: number | null;
};

const norm = (xs: string[] = []) => [...new Set(xs.map(x => x.toLowerCase().trim()).filter(Boolean))];
const overlap = (a: string[] = [], b: string[] = []) => {
  const A = new Set(norm(a)), B = new Set(norm(b));
  if (!A.size || !B.size) return 0;
  let n = 0; for (const x of A) if (B.has(x)) n++;
  return (2 * n / (A.size + B.size)) * 100;
};

export function directionMatch(user: Direction | null, team: TeamDirection | null) {
  if (!user || !team) return null;
  const future = overlap(user.future_tags ?? [], team.future_tags ?? []);
  const a = overlap(user.desired_complements ?? [], team.skill_tags ?? []);
  const b = overlap(team.needed_skills ?? [], user.skill_tags ?? []);
  const complement = (a + b) / 2;
  const uev = user.evidence_count ?? 0, tev = team.proof_count ?? 0;
  const uv = uev ? (user.verified_evidence_count ?? 0) / uev : 0;
  const tv = tev ? (team.verified_proof_count ?? 0) / tev : 0;
  const proof = Math.min(100, ((uv + tv) / 2) * 70 + Math.log2(1 + uev + tev) * 8);
  const uh = user.weekly_commitment_hours, th = team.weekly_commitment_hours;
  const hours = uh == null || th == null ? 60 : Math.max(0, 100 - Math.abs(uh - th) * 6);
  const rhythm = Math.min(100, hours * .55 + Math.min(12, user.active_weeks_12 ?? 0) / 12 * 30 + Math.min(12, user.team_continuity_months ?? 0) / 12 * 15);
  const total = future * .35 + proof * .30 + complement * .20 + rhythm * .15;
  return {
    total: Math.round(total), future: Math.round(future), proof: Math.round(proof),
    complement: Math.round(complement), rhythm: Math.round(rhythm)
  };
}

export function personMatch(viewer: PersonSignal | null, candidate: PersonSignal | null) {
  if (!viewer || !candidate) return null;
  const vd = viewer.direction ?? null;
  const cd = candidate.direction ?? null;
  const weighted: { score: number; weight: number }[] = [];

  if ((vd?.future_tags?.length ?? 0) && (cd?.future_tags?.length ?? 0)) {
    weighted.push({ score: overlap(vd?.future_tags ?? [], cd?.future_tags ?? []), weight: 25 });
  }

  if ((vd?.desired_complements?.length ?? 0) && (cd?.skill_tags?.length ?? 0)) {
    weighted.push({ score: overlap(vd?.desired_complements ?? [], cd?.skill_tags ?? []), weight: 25 });
  }

  const viewerDomains = [...(viewer.domains ?? []), ...(viewer.goalDomains ?? [])];
  const candidateDomains = [...(candidate.domains ?? []), ...(candidate.goalDomains ?? [])];
  if (viewerDomains.length && candidateDomains.length) {
    weighted.push({ score: overlap(viewerDomains, candidateDomains), weight: 18 });
  }

  if ((viewer.openTo?.length ?? 0) && (candidate.openTo?.length ?? 0)) {
    weighted.push({ score: overlap(viewer.openTo ?? [], candidate.openTo ?? []), weight: 10 });
  }

  if ((vd?.weekly_commitment_hours ?? 0) > 0 && (cd?.weekly_commitment_hours ?? 0) > 0) {
    const hours = Math.max(0, 100 - Math.abs((vd?.weekly_commitment_hours ?? 0) - (cd?.weekly_commitment_hours ?? 0)) * 7);
    weighted.push({ score: hours, weight: 7 });
  }

  const proofCount = candidate.proofCount ?? cd?.evidence_count ?? 0;
  const verified = candidate.verifiedProofCount ?? cd?.verified_evidence_count ?? 0;
  if (proofCount > 0 || verified > 0) {
    weighted.push({ score: Math.min(100, 35 + proofCount * 8 + verified * 12), weight: 8 });
  }

  const recent = candidate.recentRecords ?? cd?.active_weeks_12 ?? 0;
  if (recent > 0) {
    weighted.push({ score: Math.min(100, recent * 18), weight: 7 });
  }

  if (weighted.length < 2) return null;
  const weightSum = weighted.reduce((sum, x) => sum + x.weight, 0);
  const raw = weighted.reduce((sum, x) => sum + x.score * x.weight, 0) / weightSum;
  return { total: Math.round(Math.max(1, Math.min(99, raw))) };
}

export function opportunityMatch(user: Direction | null, opportunity: Opportunity | null) {
  if (!user || !opportunity) return null;

  const future = overlap(user.future_tags ?? [], opportunity.desired_future_tags ?? []);
  const skills = overlap(user.skill_tags ?? [], opportunity.required_skills ?? []);
  const domain = opportunity.domain && (user.preferred_domains ?? []).includes(opportunity.domain) ? 100 : 45;
  const stage = !opportunity.desired_stage || !user.stage ? 60 : user.stage.toLowerCase() === opportunity.desired_stage.toLowerCase() ? 100 : 45;

  const verified = user.verified_evidence_count ?? 0;
  const neededVerified = opportunity.minimum_verified_proofs ?? 0;
  const proof = neededVerified === 0 ? Math.min(100, 55 + verified * 8) : Math.min(100, (verified / Math.max(1, neededVerified)) * 100);

  const teamMonths = user.team_continuity_months ?? 0;
  const neededMonths = opportunity.minimum_team_months ?? 0;
  const collaboration = neededMonths === 0 ? Math.min(100, 55 + teamMonths * 5) : Math.min(100, (teamMonths / Math.max(1, neededMonths)) * 100);

  const activity = Math.min(100, (Math.min(12, user.active_weeks_12 ?? 0) / 12) * 100);
  const total = future * .25 + skills * .25 + domain * .15 + stage * .10 + proof * .10 + collaboration * .10 + activity * .05;

  return { total: Math.round(total) };
}
