import type { Metadata } from 'next';
import { SITE } from '@/config/constants';
import { env } from '@/config/env';
import type { PostDTO } from '@/types/blog';

export function absoluteUrl(path: string): string {
  return `${env.SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildSiteMetadata(params: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = absoluteUrl(params.path);
  return {
    title: params.title,
    description: params.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: params.title,
      description: params.description,
      siteName: SITE.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: params.title,
      description: params.description,
    },
  };
}

export function buildPostMetadata(post: PostDTO): Metadata {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const ogImage = absoluteUrl(post.ogImageUrl);
  return {
    title: post.seo.metaTitle,
    description: post.seo.metaDescription,
    keywords: post.seo.keywords,
    alternates: { canonical: post.seo.canonicalUrl ?? url },
    openGraph: {
      type: 'article',
      url,
      title: post.seo.metaTitle,
      description: post.seo.metaDescription,
      siteName: SITE.name,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo.metaTitle,
      description: post.seo.metaDescription,
      images: [ogImage],
    },
  };
}
