/**
 * Grant matching algorithm: ranks grants by fit to CIC profile.
 * Uses eligibility agent and optional keyword/amount preferences.
 */

import { db } from '../db/index.js';
import { analyseEligibility, type OrgProfile, type GrantProfile, type EligibilityResult } from './eligibility.js';

export type GrantMatch = {
  grant: GrantProfile;
  eligibility: EligibilityResult;
  rankScore: number;
};

export async function getMatchesForOrganization(organizationId: string, limit = 50): Promise<GrantMatch[]> {
  const orgRow = (await db.get(
    'SELECT sector, location, mission FROM organizations WHERE id = $1',
    [organizationId]
  )) as { sector: string | null; location: string | null; mission: string | null } | undefined;
  if (!orgRow) return [];

  const financial = (await db.get(
    'SELECT annual_turnover FROM organization_financials WHERE organization_id = $1',
    [organizationId]
  )) as { annual_turnover: number | null } | undefined;

  const org: OrgProfile = {
    sector: orgRow.sector,
    location: orgRow.location,
    mission: orgRow.mission,
    annualTurnover: financial?.annual_turnover ?? null,
  };

  const grants = (await db.all(
    'SELECT id, title, description, funder, amount_min, amount_max, eligibility_json, requirements_json FROM grants'
  )) as GrantProfile[];

  const matches: GrantMatch[] = grants.map((grant) => {
    const eligibility = analyseEligibility(org, grant);
    const rankScore = eligibility.score;
    return { grant, eligibility, rankScore };
  });

  matches.sort((a, b) => b.rankScore - a.rankScore);
  return matches.slice(0, limit);
}
