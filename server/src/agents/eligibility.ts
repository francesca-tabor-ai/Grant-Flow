/**
 * Eligibility analysis agent: scores how well an organisation matches a grant.
 * Rule-based implementation; can be replaced with LLM or external API later.
 */

export type OrgProfile = {
  sector: string | null;
  location: string | null;
  mission: string | null;
  annualTurnover?: number | null;
};

export type GrantProfile = {
  id: string;
  title: string;
  description: string | null;
  funder: string | null;
  amount_min: number | null;
  amount_max: number | null;
  eligibility_json: string | null;
  requirements_json: string | null;
};

export type EligibilityResult = {
  score: number;
  eligible: boolean;
  reasons: string[];
  warnings: string[];
};

function parseJson<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export function analyseEligibility(org: OrgProfile, grant: GrantProfile): EligibilityResult {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let score = 50; // base score

  // Sector match from grant description/keywords
  const desc = (grant.description ?? '').toLowerCase();
  const title = (grant.title ?? '').toLowerCase();
  const orgSector = (org.sector ?? '').toLowerCase();
  const orgMission = (org.mission ?? '').toLowerCase();
  if (orgSector && (desc.includes(orgSector) || title.includes(orgSector) || desc.includes('community') && orgMission.includes('community'))) {
    score += 15;
    reasons.push('Sector aligns with grant focus');
  } else if (orgSector) {
    warnings.push('Sector may not align with grant focus');
  }

  // Turnover vs grant amount (rough fit)
  const maxAmount = grant.amount_max ?? grant.amount_min;
  if (typeof org.annualTurnover === 'number' && maxAmount != null) {
    if (org.annualTurnover >= maxAmount * 0.5) {
      score += 10;
      reasons.push('Organisation size appears suitable for grant amount');
    } else if (org.annualTurnover < maxAmount * 0.1) {
      score -= 5;
      warnings.push('Grant amount is large relative to turnover');
    }
  }

  // Explicit eligibility criteria from grant (if stored)
  const eligibility = parseJson<{ sectors?: string[]; locations?: string[] }>(grant.eligibility_json);
  if (eligibility?.sectors?.length && org.sector) {
    const match = eligibility.sectors.some((s) => s.toLowerCase().includes(org.sector!.toLowerCase()));
    if (match) {
      score += 15;
      reasons.push('Matches stated eligibility sectors');
    }
  }
  if (eligibility?.locations?.length && org.location) {
    const match = eligibility.locations.some((l) => l.toLowerCase().includes(org.location!.toLowerCase()));
    if (match) {
      score += 10;
      reasons.push('Location within eligible area');
    }
  }

  const finalScore = Math.max(0, Math.min(100, score));
  return {
    score: finalScore,
    eligible: finalScore >= 50 && warnings.length < 2,
    reasons,
    warnings,
  };
}
