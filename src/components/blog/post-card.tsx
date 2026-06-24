import Link from 'next/link';
import { CategoryTag } from '@/components/common/category-tag';
import { PostMeta } from '@/components/blog/post-meta';
import { CATEGORY_BY_SLUG } from '@/config/constants';
import type { PostDTO } from '@/types/blog';

export function PostCard({ post }: { post: PostDTO }) {
  const category = CATEGORY_BY_SLUG[post.categorySlug];
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-surface-100 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/blog/${post.slug}`} className="block aspect-[16/9] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.coverImageUrl}
          alt={post.coverImageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <CategoryTag
          name={category?.name ?? post.categoryName}
          href={`/category/${post.categorySlug}`}
          variant={category?.tagVariant ?? 'teal'}
        />
        <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-navy">
          <Link href={`/blog/${post.slug}`} className="hover:text-brand">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted">{post.excerpt}</p>
        <PostMeta post={post} className="mt-3" />
      </div>
    </article>
  );
}
