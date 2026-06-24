import Link from 'next/link';
import { PostGrid } from '@/components/blog/post-grid';
import { POSTS_PER_PAGE } from '@/config/constants';
import { buildSiteMetadata } from '@/lib/seo/metadata';
import {
  countPublishedPosts,
  getPublishedPosts,
  searchPublishedPosts,
} from '@/services/post-service';
import type { PostDTO } from '@/types/blog';

export const revalidate = 600;

export const metadata = buildSiteMetadata({
  title: 'Blog',
  description:
    'Practical guides on invoicing, B2B credit, cashflow, accounting and small-business fintech.',
  path: '/blog',
});

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  let posts: PostDTO[] = [];
  let total = 0;

  try {
    if (q) {
      posts = await searchPublishedPosts(q);
      total = posts.length;
    } else {
      posts = await getPublishedPosts({
        limit: POSTS_PER_PAGE,
        skip: (currentPage - 1) * POSTS_PER_PAGE,
      });
      total = await countPublishedPosts();
    }
  } catch {
    posts = [];
  }

  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  return (
    <div className="mx-auto max-w-content px-4 py-8">
      <h1 className="font-heading text-3xl font-extrabold text-navy">
        {q ? `Search results for “${q}”` : 'All articles'}
      </h1>
      <p className="mt-2 text-muted">
        {q
          ? `${posts.length} matching article${posts.length === 1 ? '' : 's'}.`
          : 'Practical guides for finance teams, accountants and small businesses.'}
      </p>

      {posts.length === 0 ? (
        <p className="py-16 text-center text-muted">
          No articles found{q ? ' for that search' : ' yet'}.
        </p>
      ) : (
        <div className="mt-8">
          <PostGrid posts={posts} />
        </div>
      )}

      {!q && totalPages > 1 ? (
        <nav className="mt-10 flex items-center justify-center gap-4">
          {currentPage > 1 ? (
            <Link
              href={`/blog?page=${currentPage - 1}`}
              className="rounded-md border border-surface-100 px-4 py-2 font-heading text-sm font-semibold text-navy hover:border-brand hover:text-brand"
            >
              ← Previous
            </Link>
          ) : null}
          <span className="text-sm text-muted">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages ? (
            <Link
              href={`/blog?page=${currentPage + 1}`}
              className="rounded-md border border-surface-100 px-4 py-2 font-heading text-sm font-semibold text-navy hover:border-brand hover:text-brand"
            >
              Next →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
