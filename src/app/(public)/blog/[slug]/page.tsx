import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostContent } from '@/components/blog/post-content';
import { PostGrid } from '@/components/blog/post-grid';
import { PostMeta } from '@/components/blog/post-meta';
import { ViewTracker } from '@/components/blog/view-tracker';
import { CategoryTag } from '@/components/common/category-tag';
import { JsonLd } from '@/components/common/json-ld';
import { CATEGORY_BY_SLUG, productFor } from '@/config/constants';
import { breadcrumbJsonLd, faqJsonLd, postJsonLd } from '@/lib/seo/json-ld';
import { buildPostMetadata } from '@/lib/seo/metadata';
import {
  getAllPublishedSlugs,
  getPostBySlug,
  getRelatedPosts,
} from '@/services/post-service';
import type { PostDTO } from '@/types/blog';

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const slugs = await getAllPublishedSlugs();
    return slugs.map((entry) => ({ slug: entry.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    return post ? buildPostMetadata(post) : {};
  } catch {
    return {};
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post: PostDTO | null = null;
  try {
    post = await getPostBySlug(slug);
  } catch {
    post = null;
  }
  if (!post) notFound();

  const category = CATEGORY_BY_SLUG[post.categorySlug];
  const product = productFor(post.targetProduct);

  let related: PostDTO[] = [];
  try {
    related = await getRelatedPosts(post, 3);
  } catch {
    related = [];
  }

  const faq = faqJsonLd(post);

  return (
    <article>
      <ViewTracker slug={post.slug} />
      <JsonLd data={postJsonLd(post)} />
      {faq ? <JsonLd data={faq} /> : null}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: category?.name ?? post.categoryName, path: `/category/${post.categorySlug}` },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />

      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.coverImageUrl}
          alt={post.coverImageAlt}
          className="h-64 w-full object-cover sm:h-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/85 to-navy/20" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-3xl px-4 pb-6">
            <CategoryTag
              name={category?.name ?? post.categoryName}
              href={`/category/${post.categorySlug}`}
              variant={category?.tagVariant ?? 'teal'}
            />
            <h1 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              {post.title}
            </h1>
            <PostMeta post={post} tone="light" className="mt-3" views={post.views} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <PostContent markdown={post.content} />

        {post.faq.length > 0 ? (
          <section className="mt-12">
            <h2 className="font-heading text-2xl font-bold text-navy">
              Frequently asked questions
            </h2>
            <div className="mt-4 space-y-3">
              {post.faq.map((item) => (
                <details
                  key={item.question}
                  className="rounded-lg border border-surface-100 bg-surface-50 p-4"
                >
                  <summary className="cursor-pointer font-heading font-semibold text-navy">
                    {item.question}
                  </summary>
                  <p className="mt-2 text-sm text-[#2b3a55]">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        <aside className="mt-12 rounded-xl bg-navy p-6 text-white sm:p-8">
          <h2 className="font-heading text-xl font-bold">
            Powered by {product.name}
          </h2>
          <p className="mt-2 text-sm text-white/80">{product.blurb}</p>
          <a
            href={`${product.url}?utm_source=blog&utm_medium=cta&utm_campaign=${post.categorySlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-md bg-gold px-5 py-2.5 font-heading text-sm font-semibold text-navy transition hover:bg-orange"
          >
            Learn more about {product.name} →
          </a>
        </aside>
      </div>

      {related.length > 0 ? (
        <PostGrid posts={related} title="Related reading" />
      ) : null}
    </article>
  );
}
