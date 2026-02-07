import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://insurance-greece.com/sitemap-index.xml`;

  return new Response(robotsTxt, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
