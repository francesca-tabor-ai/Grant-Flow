/**
 * Full agent orchestration: run eligibility, matching, proposal generation,
 * compliance and validation in a single flow for an organisation + grant.
 */

import crypto from 'crypto';
import { getMatchesForOrganization } from './grantMatching.js';
import { generateProposalDraft } from './proposalWriter.js';
import { generateBudget } from './budgetGenerator.js';
import { checkCompliance, type ComplianceResult } from './complianceChecker.js';
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
  compliance: ComplianceResult | null;
};

export async function runOrchestration(input: OrchestrationInput): Promise<OrchestrationResult> {
  const { organizationId, grantId, options = {} } = input;
  const matches = await getMatchesForOrganization(organizationId, 100);
  const match = matches.find((m) => m.grant.id === grantId);
  const matchScore = match?.eligibility.score ?? 0;
  const eligible = match?.eligibility.eligible ?? false;

  let applicationId: string | null = null;
  const existingApp = (await db.get(
    'SELECT id FROM applications WHERE organization_id = $1 AND grant_id = $2',
    [organizationId, grantId]
  )) as { id: string } | undefined;
  if (existingApp) applicationId = existingApp.id;

  let proposalGenerated = false;
  let budgetGenerated = false;

  if (options.generateProposal && organizationId && grantId) {
    try {
      if (!existingApp) {
        const id = crypto.randomUUID();
        await db.run(
          "INSERT INTO applications (id, organization_id, grant_id, status, deadline) SELECT $1, $2, $3, 'draft', deadline FROM grants WHERE id = $4",
          [id, organizationId, grantId, grantId]
        );
        applicationId = id;
      }
      if (applicationId) {
        const draft = await generateProposalDraft(organizationId, grantId);
        const vRow = (await db.get(
          'SELECT COALESCE(MAX(version), 0) + 1 AS v FROM proposals WHERE application_id = $1',
          [applicationId]
        )) as { v: number };
        const nextVersion = vRow?.v ?? 1;
        const proposalId = crypto.randomUUID();
        await db.run(
          'INSERT INTO proposals (id, application_id, version, content) VALUES ($1, $2, $3, $4)',
          [proposalId, applicationId, nextVersion, draft.content]
        );
        proposalGenerated = true;
      }
    } catch {
      // leave proposalGenerated false
    }
  }

  if (options.generateBudget && applicationId) {
    try {
      const appRow = (await db.get('SELECT grant_id FROM applications WHERE id = $1', [
        applicationId,
      ])) as { grant_id: string } | undefined;
      const grant = appRow
        ? ((await db.get('SELECT title, amount_max FROM grants WHERE id = $1', [
            appRow.grant_id,
          ])) as { title: string; amount_max: number | null } | undefined)
        : undefined;
      const generated = generateBudget(options.templateId ?? 'default-project', {
        totalAmount: grant?.amount_max ?? undefined,
        grantTitle: grant?.title,
      });
      const budgetId = crypto.randomUUID();
      await db.run(
        'INSERT INTO budgets (id, application_id, template_id, json_data) VALUES ($1, $2, $3, $4)',
        [
          budgetId,
          applicationId,
          options.templateId ?? 'default-project',
          JSON.stringify({
            lines: generated.lines,
            total: generated.total,
            justification: generated.justification,
          }),
        ]
      );
      budgetGenerated = true;
    } catch {
      // leave budgetGenerated false
    }
  }

  let compliance: ComplianceResult | null = null;
  if (applicationId) {
    compliance = await checkCompliance(applicationId);
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
