import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostGrid } from '@/components/blog/post-grid';
import { CATEGORIES, CATEGORY_BY_SLUG } from '@/config/constants';
import { buildSiteMetadata } from '@/lib/seo/metadata';
import { getPublishedPosts } from '@/services/post-service';
import type { CategorySlug, PostDTO } from '@/types/blog';

export const revalidate = 600;

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG[slug as CategorySlug];
  if (!category) return {};
  return buildSiteMetadata({
    title: category.name,
    description: category.description,
    path: `/category/${slug}`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG[slug as CategorySlug];
  if (!category) notFound();

  let posts: PostDTO[] = [];
  try {
    posts = await getPublishedPosts({ categorySlug: category.slug, limit: 30 });
  } catch {
    posts = [];
  }

  return (
    <div className="mx-auto max-w-content px-4 py-8">
      <header className="border-b border-surface-100 pb-6">
        <h1 className="font-heading text-3xl font-extrabold text-navy">
          {category.name}
        </h1>
        <p className="mt-2 max-w-2xl text-muted">{category.description}</p>
      </header>

      {posts.length === 0 ? (
        <p className="py-16 text-center text-muted">
          No articles in this category yet — check back soon.
        </p>
      ) : (
        <div className="mt-8">
          <PostGrid posts={posts} />
        </div>
      )}
    </div>
  );
}
