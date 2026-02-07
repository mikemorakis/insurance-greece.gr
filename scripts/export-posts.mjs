import Database from 'better-sqlite3';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

const DB_PATH = decodeURIComponent(
  new URL('../../prisma/dev.db', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
);
const CONTENT_DIR = decodeURIComponent(
  new URL('../src/content/blog/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
);

// Convert HTML to simple markdown
function htmlToMarkdown(html) {
  if (!html) return '';
  return html
    // Headers
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    // Bold, italic
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // Links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Images
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)')
    // Lists
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    // Paragraphs and line breaks
    .replace(/<p[^>]*>(.*?)<\/p>/gis, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<div[^>]*>(.*?)<\/div>/gis, '$1\n')
    // Blockquotes
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (_, content) =>
      content.split('\n').map(line => `> ${line}`).join('\n') + '\n\n'
    )
    // Strip remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Clean up whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function slugFromPath(slugPath) {
  // /green-card/ -> green-card
  return slugPath.replace(/^\//, '').replace(/\/$/, '');
}

async function main() {
  if (!existsSync(DB_PATH)) {
    console.error(`Database not found at: ${DB_PATH}`);
    process.exit(1);
  }

  console.log(`Reading database: ${DB_PATH}`);
  const db = new Database(DB_PATH, { readonly: true });

  // Get all published posts (postType = 'post', not pages or services)
  const posts = db.prepare(`
    SELECT p.*, c.slug as categorySlug, c.name as categoryName
    FROM Post p
    LEFT JOIN Category c ON p.categoryId = c.id
    WHERE p.postType = 'post' AND p.status = 'published'
    ORDER BY p.createdAt DESC
  `).all();

  console.log(`Found ${posts.length} blog posts\n`);

  await mkdir(CONTENT_DIR, { recursive: true });

  // Remove the placeholder welcome.md
  const welcomePath = join(CONTENT_DIR, 'welcome.md');
  if (existsSync(welcomePath)) {
    const { unlink } = await import('fs/promises');
    await unlink(welcomePath);
    console.log('Removed placeholder welcome.md\n');
  }

  for (const post of posts) {
    const slug = slugFromPath(post.slugPath);
    const filename = `${slug}.md`;
    const filePath = join(CONTENT_DIR, filename);
    const markdownContent = htmlToMarkdown(post.content);
    const date = new Date(post.createdAt).toISOString().split('T')[0];

    // Build frontmatter
    const frontmatter = [
      '---',
      `title: "${post.title.replace(/"/g, '\\"')}"`,
    ];

    if (post.excerpt) frontmatter.push(`excerpt: "${post.excerpt.replace(/"/g, '\\"')}"`);
    if (post.metaTitle) frontmatter.push(`metaTitle: "${post.metaTitle.replace(/"/g, '\\"')}"`);
    if (post.metaDesc) frontmatter.push(`metaDesc: "${post.metaDesc.replace(/"/g, '\\"')}"`);
    if (post.featuredImg) frontmatter.push(`featuredImg: "${post.featuredImg}"`);
    frontmatter.push(`author: "${post.author || 'Insurance Greece'}"`);
    if (post.categorySlug) frontmatter.push(`category: "${post.categorySlug}"`);
    frontmatter.push(`status: "${post.status}"`);
    frontmatter.push(`date: ${date}`);
    frontmatter.push('---');
    frontmatter.push('');

    const fileContent = frontmatter.join('\n') + markdownContent + '\n';

    await writeFile(filePath, fileContent, 'utf-8');
    console.log(`✓ ${filename} (${post.title})`);
  }

  db.close();
  console.log(`\nExported ${posts.length} posts to ${CONTENT_DIR}`);
}

main().catch(console.error);
