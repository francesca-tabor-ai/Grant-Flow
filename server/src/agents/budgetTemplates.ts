/**
 * Budget template system: predefined line-item structures for grant applications.
 */

export type BudgetLine = {
  id: string;
  category: string;
  description: string;
  amount: number;
  notes?: string;
};

export type BudgetTemplate = {
  id: string;
  name: string;
  description: string;
  lines: Omit<BudgetLine, 'amount'>[];
};

const defaultTemplates: BudgetTemplate[] = [
  {
    id: 'default-project',
    name: 'Default project budget',
    description: 'Staff, overhead, direct costs',
    lines: [
      { id: 'staff', category: 'Staff', description: 'Staff time', notes: 'Include roles and FTE' },
      { id: 'overhead', category: 'Overhead', description: 'Overhead (e.g. 15%)', notes: '' },
      { id: 'materials', category: 'Direct costs', description: 'Materials and equipment', notes: '' },
      { id: 'travel', category: 'Direct costs', description: 'Travel and subsistence', notes: '' },
      { id: 'other', category: 'Other', description: 'Other direct costs', notes: '' },
    ],
  },
  {
    id: 'simple',
    name: 'Simple (3 lines)',
    description: 'Personnel, running costs, other',
    lines: [
      { id: 'personnel', category: 'Personnel', description: 'Salaries and fees', notes: '' },
      { id: 'running', category: 'Running costs', description: 'Operational costs', notes: '' },
      { id: 'other', category: 'Other', description: 'Other', notes: '' },
    ],
  },
];

export function listTemplates(): BudgetTemplate[] {
  return defaultTemplates;
}

export function getTemplate(id: string): BudgetTemplate | undefined {
  return defaultTemplates.find((t) => t.id === id);
}

export function instantiateTemplate(templateId: string, totalsByCategory?: Record<string, number>): BudgetLine[] {
  const template = getTemplate(templateId);
  if (!template) return [];
  return template.lines.map((line) => ({
    ...line,
    amount: totalsByCategory?.[line.id] ?? 0,
  }));
}
