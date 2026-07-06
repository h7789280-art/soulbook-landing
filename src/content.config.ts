import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Shared frontmatter schema for the content hub (blog + faq).
// The route slug comes from the file name (entry.id); the optional `slug`
// field lets an author pin an explicit slug if ever needed.
const contentSchema = z.object({
  title: z.string(),
  // Optional: for faq it is derived from the answer body at build time
  // (see src/lib/faq.ts) so a new question needs only title/category/slug/related.
  description: z.string().optional(),
  slug: z.string().optional(),
  category: z.string(),
  // Related question slugs (faq). Missing targets are silently skipped.
  related: z.array(z.string()).optional(),
  // Optional: faq questions are ordered by title, not date.
  pubDate: z.coerce.date().optional(),
  ogImage: z.string().optional(),
  // Demo/placeholder entries set draft:true → excluded from listings + noindex.
  draft: z.boolean().default(false),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: contentSchema,
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
  schema: contentSchema,
});

export const collections = { blog, faq };
