import type { MetadataRoute } from 'next';
import { CATEGORIES } from '@/config/constants';
import { env } from '@/config/env';
import { getAllPublishedSlugs } from '@/services/post-service';

export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.SITE_URL;

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/blog`, changeFrequency: 'daily', priority: 0.8 },
    ...CATEGORIES.map((category) => ({
      url: `${base}/category/${category.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];

  try {
    const posts = await getAllPublishedSlugs();
    for (const post of posts) {
      entries.push({
        url: `${base}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  } catch {
    // DB unavailable at build — static entries still emitted.
  }

  return entries;
}
