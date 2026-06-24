import Link from 'next/link';
import { CategoryTag } from '@/components/common/category-tag';
import { CATEGORY_BY_SLUG } from '@/config/constants';
import type { PostDTO } from '@/types/blog';

export function FeaturedPostCard({
  post,
  compact = false,
}: {
  post: PostDTO;
  compact?: boolean;
}) {
  const category = CATEGORY_BY_SLUG[post.categorySlug];
  return (
    <article className="group relative h-full overflow-hidden rounded-xl">
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <div className={`relative w-full ${compact ? 'aspect-[16/9]' : 'aspect-[16/10] h-full'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImageUrl}
            alt={post.coverImageAlt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/45 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <CategoryTag
            name={category?.name ?? post.categoryName}
            variant={category?.tagVariant ?? 'teal'}
          />
          <h2
            className={`mt-3 font-heading font-extrabold leading-tight text-white ${
              compact ? 'text-lg' : 'text-2xl sm:text-3xl'
            }`}
          >
            {post.title}
          </h2>
          {!compact ? (
            <p className="mt-2 hidden max-w-2xl text-sm text-white/80 sm:line-clamp-2 sm:block">
              {post.excerpt}
            </p>
          ) : null}
          <span className="mt-3 inline-block font-heading text-xs font-semibold uppercase tracking-wide text-brand-light">
            Read more →
          </span>
        </div>
      </Link>
    </article>
  );
}
