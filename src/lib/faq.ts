// Single source of truth for the FAQ / Question Engine.
// Scales to thousands of questions: adding a category = one line here;
// adding a question = one .md file in src/content/faq (no code changes).

import type { CollectionEntry } from 'astro:content';

type FaqEntry = CollectionEntry<'faq'>;

/**
 * Category slug → Russian label. Order here defines the grouping order on /faq/.
 * A new category is one line; unknown categories fall back to their raw value
 * and sort after the known ones.
 */
export const CATEGORY_LABELS: Record<string, string> = {
  'matrica-sudby': 'Матрица Судьбы',
  arkany: 'Арканы',
  karma: 'Карма',
  prednaznachenie: 'Предназначение',
  otnosheniya: 'Отношения',
  rod: 'Род',
  dengi: 'Деньги',
  'human-design': 'Human Design',
  deti: 'Дети',
  samopoznanie: 'Самопознание',
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);

/** Human label for a category slug (falls back to the raw value). */
export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

/**
 * SEO description for a question. Uses an explicit `description` frontmatter
 * field if present; otherwise derives the first paragraph of the answer
 * (preferring the "Краткий ответ" section), stripped of Markdown and trimmed
 * to a sentence boundary ≤ maxLen.
 */
export function faqDescription(entry: FaqEntry, maxLen = 175): string {
  if (entry.data.description) return entry.data.description;
  return deriveDescription(entry.body ?? '', maxLen);
}

export function deriveDescription(body: string, maxLen = 175): string {
  let text = body;
  // Jump to the answer section if the canonical heading is present.
  const anchor = text.search(/Краткий ответ/i);
  if (anchor !== -1) text = text.slice(anchor).replace(/^[^\n]*\n/, '');

  const paragraph =
    text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .find((p) => p && !p.startsWith('#') && !p.startsWith('>') && !p.startsWith('*') && !p.startsWith('-')) ?? '';

  const clean = paragraph
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links → text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/[`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (clean.length <= maxLen) return clean;

  const slice = clean.slice(0, maxLen);
  const sentenceEnd = Math.max(
    slice.lastIndexOf('. '),
    slice.lastIndexOf('! '),
    slice.lastIndexOf('? '),
  );
  if (sentenceEnd > 60) return slice.slice(0, sentenceEnd + 1).trim();
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 60 ? slice.slice(0, lastSpace) : slice).trim() + '…';
}

/**
 * Groups published questions by category in CATEGORY_ORDER, questions sorted
 * alphabetically by title within each group. Fully derived from frontmatter.
 */
export function groupByCategory(entries: FaqEntry[]) {
  const published = entries.filter((e) => !e.data.draft);
  const byCat = new Map<string, FaqEntry[]>();
  for (const e of published) {
    const arr = byCat.get(e.data.category) ?? [];
    arr.push(e);
    byCat.set(e.data.category, arr);
  }

  const known = CATEGORY_ORDER.filter((c) => byCat.has(c));
  const unknown = [...byCat.keys()]
    .filter((c) => !CATEGORY_ORDER.includes(c))
    .sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b), 'ru'));

  return [...known, ...unknown].map((category) => ({
    category,
    label: categoryLabel(category),
    items: byCat
      .get(category)!
      .sort((a, b) => a.data.title.localeCompare(b.data.title, 'ru')),
  }));
}
