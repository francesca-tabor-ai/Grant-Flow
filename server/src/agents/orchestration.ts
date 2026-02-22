/**
 * Full agent orchestration: run eligibility, matching, proposal generation,
 * compliance and validation in a single flow for an organisation + grant.
 */

import crypto from 'crypto';
import { getMatchesForOrganization } from './grantMatching.js';
import { generateProposalDraft } from './proposalWriter.js';
import { generateBudget } from './budgetGenerator.js';
import { checkCompliance } from './complianceChecker.js';
import { db } from '../db/index.js';

export type OrchestrationInput = {
  organizationId: string;
  grantId: string;
  options?: { generateProposal?: boolean; generateBudget?: boolean; templateId?: string };
};

export type OrchestrationResult = {
  matchScore: number;
  eligible: boolean;
  proposalGenerated: boolean;
  budgetGenerated: boolean;
  applicationId: string | null;
  compliance: ReturnType<typeof checkCompliance> | null;
};

export function runOrchestration(input: OrchestrationInput): OrchestrationResult {
  const { organizationId, grantId, options = {} } = input;
  const matches = getMatchesForOrganization(organizationId, 100);
  const match = matches.find((m) => m.grant.id === grantId);
  const matchScore = match?.eligibility.score ?? 0;
  const eligible = match?.eligibility.eligible ?? false;

  let applicationId: string | null = null;
  const existingApp = db.prepare(
    'SELECT id FROM applications WHERE organization_id = ? AND grant_id = ?'
  ).get(organizationId, grantId) as { id: string } | undefined;
  if (existingApp) applicationId = existingApp.id;

  let proposalGenerated = false;
  let budgetGenerated = false;

  if (options.generateProposal && organizationId && grantId) {
    try {
      if (!existingApp) {
        const id = crypto.randomUUID();
        db.prepare(
          'INSERT INTO applications (id, organization_id, grant_id, status, deadline) SELECT ?, ?, ?, \'draft\', deadline FROM grants WHERE id = ?'
        ).run(id, organizationId, grantId, grantId);
        applicationId = id;
      }
      if (applicationId) {
        const draft = generateProposalDraft(organizationId, grantId);
        const nextVersion = (db.prepare('SELECT COALESCE(MAX(version), 0) + 1 AS v FROM proposals WHERE application_id = ?').get(applicationId) as { v: number }).v;
        const proposalId = crypto.randomUUID();
        db.prepare('INSERT INTO proposals (id, application_id, version, content) VALUES (?, ?, ?, ?)').run(
          proposalId,
          applicationId,
          nextVersion,
          draft.content
        );
        proposalGenerated = true;
      }
    } catch {
      // leave proposalGenerated false
    }
  }

  if (options.generateBudget && applicationId) {
    try {
      const appRow = db.prepare('SELECT grant_id FROM applications WHERE id = ?').get(applicationId) as { grant_id: string } | undefined;
      const grant = appRow ? db.prepare('SELECT title, amount_max FROM grants WHERE id = ?').get(appRow.grant_id) as { title: string; amount_max: number | null } | undefined : undefined;
      const generated = generateBudget(options.templateId ?? 'default-project', {
        totalAmount: grant?.amount_max ?? undefined,
        grantTitle: grant?.title,
      });
      const budgetId = crypto.randomUUID();
      db.prepare(
        'INSERT INTO budgets (id, application_id, template_id, json_data) VALUES (?, ?, ?, ?)'
      ).run(budgetId, applicationId, options.templateId ?? 'default-project', JSON.stringify({
        lines: generated.lines,
        total: generated.total,
        justification: generated.justification,
      }));
      budgetGenerated = true;
    } catch {
      // leave budgetGenerated false
    }
  }

  let compliance: ReturnType<typeof checkCompliance> | null = null;
  if (applicationId) {
    compliance = checkCompliance(applicationId);
  }

  return {
    matchScore,
    eligible,
    proposalGenerated,
    budgetGenerated,
    applicationId,
    compliance,
  };
}
