/**
 * Budget generation agent: creates budget from template and optional org/funder context.
 * Cost justification is generated as short text per line or overall.
 */

import { getTemplate, instantiateTemplate, type BudgetLine } from './budgetTemplates.js';

export type GeneratedBudget = {
  templateId: string;
  lines: BudgetLine[];
  total: number;
  justification: string;
};

export function generateBudget(
  templateId: string,
  options?: { totalAmount?: number; grantTitle?: string }
): GeneratedBudget {
  const template = getTemplate(templateId);
  if (!template) throw new Error('Template not found');

  const lines = instantiateTemplate(templateId);
  const totalRequested = options?.totalAmount ?? 0;
  if (totalRequested > 0 && lines.length > 0) {
    const weight = 1 / lines.length;
    lines.forEach((line, i) => {
      line.amount = i < lines.length - 1
        ? Math.round(totalRequested * weight)
        : totalRequested - lines.slice(0, -1).reduce((s, l) => s + l.amount, 0);
    });
  }

  const total = lines.reduce((s, l) => s + l.amount, 0);
  const justification = `Budget prepared for ${options?.grantTitle ?? 'grant application'}. Total requested: £${total.toLocaleString()}. Costs are estimated based on project scope and organisational rates.`;
  return { templateId, lines, total, justification };
}

export function generateCostJustification(lines: BudgetLine[]): string {
  return lines
    .map((l) => `**${l.description}** (£${l.amount.toLocaleString()}): ${l.notes || 'As per project plan.'}`)
    .join('\n\n');
}
