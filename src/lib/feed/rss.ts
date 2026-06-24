import { SITE } from '@/config/constants';
import { env } from '@/config/env';
import type { PostDTO } from '@/types/blog';

function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

/** Builds an RSS 2.0 feed document from published posts. */
export function buildRssXml(posts: PostDTO[]): string {
  const items = posts
    .map((post) => {
      const url = `${env.SITE_URL}/blog/${post.slug}`;
      const pubDate = new Date(post.publishedAt ?? post.createdAt).toUTCString();
      return `    <item>
      <title>${cdata(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${cdata(post.categoryName)}</category>
      <description>${cdata(post.excerpt)}</description>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${cdata(SITE.name)}</title>
    <link>${env.SITE_URL}</link>
    <description>${cdata(SITE.description)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;
}
