// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static landing + content hub for «Вершина Души» / Apex Soul.
// Production domain: https://apexsoul.life
// Дублирует SITE_URL из src/lib/site.ts (этот конфиг — .mjs и не импортирует .ts).
export default defineConfig({
  site: 'https://apexsoul.life',
  integrations: [
    sitemap({
      // Keep noindex placeholder/demo entries out of the sitemap.
      filter: (page) => !page.includes('/demo-'),
    }),
  ],
});
