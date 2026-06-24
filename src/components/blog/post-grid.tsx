import { PostCard } from '@/components/blog/post-card';
import type { PostDTO } from '@/types/blog';

export function PostGrid({
  posts,
  title,
}: {
  posts: PostDTO[];
  title?: string;
}) {
  if (posts.length === 0) return null;
  return (
    <section className="mx-auto max-w-content px-4 py-8">
      {title ? (
        <h2 className="mb-6 font-heading text-xl font-bold text-navy">{title}</h2>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
