// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static landing + content hub for «Вершина Души» / Apex Soul.
// Production domain: https://start.soulbook.life
export default defineConfig({
  site: 'https://start.soulbook.life',
  integrations: [
    sitemap({
      // Keep noindex placeholder/demo entries out of the sitemap.
      filter: (page) => !page.includes('/demo-'),
    }),
  ],
});
