import { getAllPosts } from '@/lib/posts';
import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function GET() {
  const posts = getAllPosts();
  const items = posts
    .map((post) => {
      const url = `${siteConfig.url}/blog/${post.slug}/`;
      return `
        <item>
          <title>${escapeXml(post.title)}</title>
          <description>${escapeXml(post.description)}</description>
          <link>${url}</link>
          <guid>${url}</guid>
          <pubDate>${new Date(post.date).toUTCString()}</pubDate>
          <category>${escapeXml(post.category)}</category>
        </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>${escapeXml(siteConfig.title)}</title>
        <description>${escapeXml(siteConfig.description)}</description>
        <link>${siteConfig.url}</link>
        <language>ko-KR</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${items}
      </channel>
    </rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
