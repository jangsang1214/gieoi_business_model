type Direction = {
  future_tags?: string[] | null;
  skill_tags?: string[] | null;
  desired_complements?: string[] | null;
  weekly_commitment_hours?: number | null;
  active_weeks_12?: number | null;
  team_continuity_months?: number | null;
  evidence_count?: number | null;
  verified_evidence_count?: number | null;
};

type TeamDirection = {
  future_tags?: string[] | null;
  skill_tags?: string[] | null;
  needed_skills?: string[] | null;
  weekly_commitment_hours?: number | null;
  proof_count?: number | null;
  verified_proof_count?: number | null;
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
