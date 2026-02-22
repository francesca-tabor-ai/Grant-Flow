/**
 * Proposal writing agent: generates tailored draft from CIC data and grant requirements.
 * Template-based implementation; can be replaced with LLM (e.g. OpenAI) when API key is available.
 */

import { db } from '../db/index.js';
import { parseGrantRequirements } from './requirementsParsing.js';

export type ProposalDraft = {
  content: string;
  sections: Array<{ heading: string; text: string }>;
};

export async function generateProposalDraft(organizationId: string, grantId: string): Promise<ProposalDraft> {
  const org = (await db.get(
    'SELECT name, mission, sector, location FROM organizations WHERE id = $1',
    [organizationId]
  )) as { name: string; mission: string | null; sector: string | null; location: string | null } | undefined;
  const grant = (await db.get(
    'SELECT title, description, funder, requirements_json FROM grants WHERE id = $1',
    [grantId]
  )) as { title: string; description: string | null; funder: string | null; requirements_json: string | null } | undefined;

  if (!org || !grant) {
    throw new Error('Organization or grant not found');
  }

  const { sections } = parseGrantRequirements(grant.requirements_json, grant.description);
  const name = org.name ?? 'Our organisation';
  const mission = org.mission ?? 'We deliver impact in our community.';
  const sector = org.sector ?? 'Community';
  const location = org.location ?? '';

  const intro = `**About ${name}**\n\n${mission}\n\nWe operate in the ${sector} sector${location ? ` and are based in ${location}.` : '.'} This application is for: **${grant.title}**${grant.funder ? ` (${grant.funder})` : ''}.\n\n`;

  const sectionBlocks = sections.length
    ? sections.map((heading) => ({
        heading,
        text: `[Draft content for "${heading}" – replace with your narrative, using your organisation's impact data and programmes where relevant.]`,
      }))
    : [
        { heading: 'Project summary', text: '[Summarise the project or activity you are seeking funding for.]' },
        { heading: 'Objectives and outcomes', text: '[Describe what you will achieve and how you will measure success.]' },
        { heading: 'Delivery and timeline', text: '[Outline how and when you will deliver the work.]' },
      ];

  const content = intro + sectionBlocks.map((s) => `## ${s.heading}\n\n${s.text}`).join('\n\n');
  return { content, sections: sectionBlocks };
}
