import { describe, it, expect } from 'vitest';
import { analyseEligibility } from './eligibility';

describe('eligibility agent', () => {
  it('returns base score when org has no sector', () => {
    const result = analyseEligibility(
      { sector: null, location: null, mission: null },
      {
        id: 'g1',
        title: 'Community Fund',
        description: 'For community organisations',
        funder: 'Trust',
        amount_min: 1000,
        amount_max: 10000,
        eligibility_json: null,
        requirements_json: null,
      }
    );
    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.reasons).toBeDefined();
    expect(result.warnings).toBeDefined();
  });

  it('increases score when sector matches grant focus', () => {
    const result = analyseEligibility(
      { sector: 'community', location: null, mission: 'We support local community' },
      {
        id: 'g1',
        title: 'Community Impact Fund',
        description: 'Funding for community organisations',
        funder: 'NCF',
        amount_min: 5000,
        amount_max: 50000,
        eligibility_json: null,
        requirements_json: null,
      }
    );
    expect(result.score).toBeGreaterThan(50);
    expect(result.eligible).toBe(true);
  });
});
