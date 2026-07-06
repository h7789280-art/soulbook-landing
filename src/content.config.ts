import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Shared frontmatter schema for the content hub (blog + faq).
// The route slug comes from the file name (entry.id); the optional `slug`
// field lets an author pin an explicit slug if ever needed.
const contentSchema = z.object({
  title: z.string(),
  description: z.string(),
  slug: z.string().optional(),
  category: z.string(),
  pubDate: z.coerce.date(),
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
