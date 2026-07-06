// One-shot importer: splits the approved Q&A batch into individual faq .md files.
// Frontmatter kept minimal (title/category/slug/related) — description is derived
// at build time (see src/lib/faq.ts). The trailing "> **CTA:**" block is stripped;
// the leading "# Title" H1 is dropped (rendered by the template from `title`).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = process.argv[2];
const OUT_DIR = join(process.cwd(), 'src', 'content', 'faq');
mkdirSync(OUT_DIR, { recursive: true });

const raw = readFileSync(SRC, 'utf8');

// Split on ```yaml … ``` frontmatter fences.
const parts = raw.split(/```yaml\r?\n/).slice(1); // drop preamble before first block
let count = 0;

for (const part of parts) {
  const fenceEnd = part.indexOf('```');
  const yamlText = part.slice(0, fenceEnd);
  let body = part.slice(fenceEnd + 3);

  const title = (yamlText.match(/title:\s*"([\s\S]*?)"/) || [])[1];
  const category = (yamlText.match(/category:\s*"([\s\S]*?)"/) || [])[1];
  const slug = (yamlText.match(/slug:\s*"([\s\S]*?)"/) || [])[1];
  const related = [];
  const relBlock = (yamlText.match(/related:\s*\r?\n([\s\S]*)$/) || [])[1] || '';
  for (const line of relBlock.split(/\r?\n/)) {
    const m = line.match(/^\s*-\s*(.+?)\s*$/);
    if (m) related.push(m[1].replace(/^["']|["']$/g, ''));
    else if (line.trim() && !/^\s*-/.test(line)) break;
  }

  if (!title || !category || !slug) {
    throw new Error(`Malformed block (title/category/slug missing): ${yamlText.slice(0, 80)}`);
  }

  // Drop everything from the final CTA blockquote onward (removes CTA + the `---` divider).
  const ctaIdx = body.search(/^\s*>\s*\*\*CTA:/m);
  if (ctaIdx !== -1) body = body.slice(0, ctaIdx);
  // Remove leading "# Title" H1 (the template renders the title itself).
  body = body.replace(/^\s*#\s+.*\r?\n/, '');
  // Tidy edges + any stray trailing horizontal rule.
  body = body.replace(/\r\n/g, '\n').replace(/\n?-{3,}\s*$/,'').trim() + '\n';

  const relYaml = related.length
    ? `related:\n${related.map((r) => `  - ${r}`).join('\n')}\n`
    : '';
  const frontmatter =
    `---\n` +
    `title: "${title.replace(/"/g, '\\"')}"\n` +
    `category: "${category}"\n` +
    `slug: "${slug}"\n` +
    relYaml +
    `---\n\n`;

  writeFileSync(join(OUT_DIR, `${slug}.md`), frontmatter + body, 'utf8');
  count++;
  console.log(`✓ ${slug}.md  (${title})  related=[${related.join(', ')}]`);
}

console.log(`\nDone: ${count} faq files written to src/content/faq/`);
