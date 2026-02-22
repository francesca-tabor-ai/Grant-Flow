/**
 * Grant requirements parsing: extract structured criteria from grant text/JSON.
 * Used to drive proposal generation and compliance checks.
 */

export type ParsedRequirement = {
  type: 'word_limit' | 'section' | 'eligibility' | 'deadline' | 'theme' | 'other';
  label: string;
  value: string | number | null;
  raw?: string;
};

export type ParsedRequirements = {
  requirements: ParsedRequirement[];
  wordLimits: Record<string, number>;
  sections: string[];
};

function parseJson<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export function parseGrantRequirements(requirementsJson: string | null, description: string | null): ParsedRequirements {
  const requirements: ParsedRequirement[] = [];
  const wordLimits: Record<string, number> = {};
  const sections: string[] = [];

  const fromJson = parseJson<{ sections?: string[]; word_limits?: Record<string, number>; criteria?: string[] }>(requirementsJson);
  if (fromJson?.sections?.length) {
    fromJson.sections.forEach((s) => {
      sections.push(s);
      requirements.push({ type: 'section', label: s, value: null });
    });
  }
  if (fromJson?.word_limits && typeof fromJson.word_limits === 'object') {
    Object.entries(fromJson.word_limits).forEach(([k, v]) => {
      const n = Number(v);
      if (!Number.isNaN(n)) {
        wordLimits[k] = n;
        requirements.push({ type: 'word_limit', label: k, value: n });
      }
    });
  }
  if (fromJson?.criteria?.length) {
    fromJson.criteria.forEach((c) => requirements.push({ type: 'eligibility', label: c, value: null, raw: c }));
  }

  const text = description ?? '';
  const wordLimitMatch = text.match(/(?:word limit|max(?:imum)?)\s*[:\s]*(\d+)\s*words?/i)
    ?? text.match(/(\d+)\s*words?\s*(?:max|maximum)?/i);
  if (wordLimitMatch && !Object.keys(wordLimits).length) {
    const n = parseInt(wordLimitMatch[1], 10);
    if (!Number.isNaN(n)) {
      wordLimits.general = n;
      requirements.push({ type: 'word_limit', label: 'general', value: n });
    }
  }

  return { requirements, wordLimits, sections };
}
