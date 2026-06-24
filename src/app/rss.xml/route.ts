import { buildRssXml } from '@/lib/feed/rss';
import { getPublishedPosts } from '@/services/post-service';
import type { PostDTO } from '@/types/blog';

export const revalidate = 600;

export async function GET() {
  let posts: PostDTO[] = [];
  try {
    posts = await getPublishedPosts({ limit: 30 });
  } catch {
    posts = [];
  }

  return new Response(buildRssXml(posts), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  });
}
