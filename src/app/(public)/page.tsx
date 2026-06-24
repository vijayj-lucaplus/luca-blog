import Link from 'next/link';
import { Hero } from '@/components/blog/hero';
import { PostGrid } from '@/components/blog/post-grid';
import { CATEGORIES } from '@/config/constants';
import { getPublishedPosts } from '@/services/post-service';
import type { PostDTO } from '@/types/blog';

export const revalidate = 600;

async function loadPosts(): Promise<PostDTO[]> {
  try {
    return await getPublishedPosts({ limit: 13 });
  } catch {
    return [];
  }
}

function EmptyHome() {
  return (
    <section className="mx-auto max-w-content px-4 py-20 text-center">
      <h1 className="font-heading text-3xl font-extrabold text-navy">
        Fresh articles are on the way
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-muted">
        Our AI editorial pipeline publishes practical guides on invoicing,
        cashflow, accounting and small-business fintech. Check back soon, or
        explore a topic below.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="rounded-full border border-surface-100 px-4 py-2 font-heading text-sm font-semibold text-navy transition hover:border-brand hover:text-brand"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const posts = await loadPosts();
  if (posts.length === 0) return <EmptyHome />;

  const [featured, ...rest] = posts;
  const secondary = rest.slice(0, 2);
  const grid = rest.slice(2);

  return (
    <>
      <Hero featured={featured} secondary={secondary} />
      <PostGrid posts={grid} title="Latest articles" />
    </>
  );
}
