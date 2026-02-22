/**
 * Compliance checker agent: validates application against grant requirements
 * and returns a list of issues and readiness.
 */

import { db } from '../db/index.js';
import { parseGrantRequirements } from './requirementsParsing.js';

export type ComplianceIssue = {
  code: string;
  message: string;
  severity: 'error' | 'warning';
};

export type ComplianceResult = {
  ready: boolean;
  issues: ComplianceIssue[];
  checks: { name: string; passed: boolean }[];
};

export async function checkCompliance(applicationId: string): Promise<ComplianceResult> {
  const issues: ComplianceIssue[] = [];
  const checks: { name: string; passed: boolean }[] = [];

  const app = (await db.get(
    'SELECT a.id, a.status, a.organization_id, a.grant_id FROM applications a WHERE a.id = $1',
    [applicationId]
  )) as { id: string; status: string; organization_id: string; grant_id: string } | undefined;
  if (!app) {
    return { ready: false, issues: [{ code: 'NOT_FOUND', message: 'Application not found', severity: 'error' }], checks: [] };
  }

  const grant = (await db.get(
    'SELECT title, description, requirements_json, deadline FROM grants WHERE id = $1',
    [app.grant_id]
  )) as { title: string; description: string | null; requirements_json: string | null; deadline: string | null } | undefined;
  if (!grant) {
    return { ready: false, issues: [{ code: 'GRANT_MISSING', message: 'Grant not found', severity: 'error' }], checks: [] };
  }

  const proposal = (await db.get(
    'SELECT id, content FROM proposals WHERE application_id = $1 ORDER BY version DESC LIMIT 1',
    [applicationId]
  )) as { id: string; content: string } | undefined;
  const hasProposal = !!proposal?.content?.trim();
  checks.push({ name: 'Proposal content', passed: hasProposal });
  if (!hasProposal) issues.push({ code: 'NO_PROPOSAL', message: 'No proposal draft or content', severity: 'error' });

  const { wordLimits } = parseGrantRequirements(grant.requirements_json, grant.description);
  if (Object.keys(wordLimits).length > 0 && proposal?.content) {
    const wordCount = proposal.content.split(/\s+/).filter(Boolean).length;
    const limit = wordLimits.general ?? Object.values(wordLimits)[0];
    const withinLimit = limit == null || wordCount <= limit;
    checks.push({ name: 'Word limit', passed: withinLimit });
    if (!withinLimit && limit != null) {
      issues.push({ code: 'WORD_LIMIT', message: `Proposal exceeds word limit (${wordCount} > ${limit})`, severity: 'warning' });
    }
  }

  const budget = await db.get('SELECT id FROM budgets WHERE application_id = $1', [applicationId]);
  const hasBudget = !!budget;
  checks.push({ name: 'Budget', passed: hasBudget });
  if (!hasBudget) issues.push({ code: 'NO_BUDGET', message: 'No budget attached', severity: 'warning' });

  const deadlinePassed = grant.deadline ? new Date(grant.deadline) < new Date() : false;
  checks.push({ name: 'Deadline not passed', passed: !deadlinePassed });
  if (deadlinePassed) issues.push({ code: 'DEADLINE_PASSED', message: 'Grant deadline has passed', severity: 'error' });

  const ready = issues.filter((i) => i.severity === 'error').length === 0;
  return { ready, issues, checks };
}
