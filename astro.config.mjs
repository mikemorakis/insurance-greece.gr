// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://insurance-greece.com',
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    preact({ compat: true }),
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/thank-you/'),
    }),
  ],
});
