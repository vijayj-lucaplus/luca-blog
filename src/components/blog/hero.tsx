import { FeaturedPostCard } from '@/components/blog/featured-post-card';
import type { PostDTO } from '@/types/blog';

export function Hero({
  featured,
  secondary,
}: {
  featured: PostDTO;
  secondary: PostDTO[];
}) {
  return (
    <section className="mx-auto max-w-content px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FeaturedPostCard post={featured} />
        </div>
        <div className="flex flex-col gap-6">
          {secondary.slice(0, 2).map((post) => (
            <FeaturedPostCard key={post.id} post={post} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
