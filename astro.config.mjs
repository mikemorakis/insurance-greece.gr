// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://insurance-greece.com',
  trailingSlash: 'always',
  output: 'static',
  integrations: [react(), sitemap()],
});
