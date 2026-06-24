import { connectToDatabase } from '@/lib/db/mongoose';
import { Post, type IPost } from '@/models/post';
import type { CategorySlug, PostDTO, SeoMeta, FaqItem, TargetProduct } from '@/types/blog';

type LeanPost = IPost & { _id: unknown };

function toDTO(doc: LeanPost): PostDTO {
  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    content: doc.content,
    categorySlug: doc.categorySlug,
    categoryName: doc.categoryName,
    tags: doc.tags ?? [],
    coverImageUrl: doc.coverImageUrl,
    coverImageAlt: doc.coverImageAlt,
    ogImageUrl: doc.ogImageUrl,
    author: doc.author,
    targetProduct: doc.targetProduct,
    readingTimeMinutes: doc.readingTimeMinutes,
    wordCount: doc.wordCount,
    qualityScore: doc.qualityScore,
    views: doc.views ?? 0,
    status: doc.status,
    seo: {
      metaTitle: doc.seo?.metaTitle ?? doc.title,
      metaDescription: doc.seo?.metaDescription ?? doc.excerpt,
      canonicalUrl: doc.seo?.canonicalUrl,
      keywords: doc.seo?.keywords ?? [],
      focusKeyword: doc.seo?.focusKeyword,
    },
    faq: doc.faq ?? [],
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : null,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

export async function getPublishedPosts(options: {
  limit?: number;
  skip?: number;
  categorySlug?: CategorySlug;
} = {}): Promise<PostDTO[]> {
  await connectToDatabase();
  const query: Record<string, unknown> = { status: 'published' };
  if (options.categorySlug) query.categorySlug = options.categorySlug;

  const docs = await Post.find(query)
    .sort({ publishedAt: -1 })
    .skip(options.skip ?? 0)
    .limit(options.limit ?? 50)
    .lean<LeanPost[]>();

  return docs.map(toDTO);
}

export async function searchPublishedPosts(
  query: string,
  limit = 30,
): Promise<PostDTO[]> {
  await connectToDatabase();
  const safe = query
    .trim()
    .slice(0, 80)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!safe) return [];

  const docs = await Post.find({
    status: 'published',
    title: { $regex: safe, $options: 'i' },
  })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean<LeanPost[]>();
  return docs.map(toDTO);
}

export async function countPublishedPosts(
  categorySlug?: CategorySlug,
): Promise<number> {
  await connectToDatabase();
  const query: Record<string, unknown> = { status: 'published' };
  if (categorySlug) query.categorySlug = categorySlug;
  return Post.countDocuments(query);
}

export async function getPostBySlug(slug: string): Promise<PostDTO | null> {
  await connectToDatabase();
  const doc = await Post.findOne({ slug, status: 'published' }).lean<LeanPost>();
  return doc ? toDTO(doc) : null;
}

export async function getAllPublishedSlugs(): Promise<
  { slug: string; updatedAt: string; publishedAt: string | null }[]
> {
  await connectToDatabase();
  const docs = await Post.find({ status: 'published' })
    .select('slug updatedAt publishedAt')
    .sort({ publishedAt: -1 })
    .lean<LeanPost[]>();
  return docs.map((doc) => ({
    slug: doc.slug,
    updatedAt: new Date(doc.updatedAt).toISOString(),
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : null,
  }));
}

export async function getRelatedPosts(
  post: Pick<PostDTO, 'slug' | 'categorySlug'>,
  limit = 3,
): Promise<PostDTO[]> {
  await connectToDatabase();
  const docs = await Post.find({
    status: 'published',
    categorySlug: post.categorySlug,
    slug: { $ne: post.slug },
  })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean<LeanPost[]>();
  return docs.map(toDTO);
}

export async function getPostsSince(sinceDays: number): Promise<PostDTO[]> {
  await connectToDatabase();
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);
  const docs = await Post.find({
    status: 'published',
    publishedAt: { $gte: since },
  })
    .sort({ publishedAt: -1 })
    .lean<LeanPost[]>();
  return docs.map(toDTO);
}

export async function slugExists(slug: string): Promise<boolean> {
  await connectToDatabase();
  return (await Post.countDocuments({ slug })) > 0;
}

export async function focusKeywordExists(focusKeyword: string): Promise<boolean> {
  await connectToDatabase();
  return (
    (await Post.countDocuments({ 'seo.focusKeyword': focusKeyword })) > 0
  );
}

export interface CreatePostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverImageAlt: string;
  ogImageUrl: string;
  categorySlug: CategorySlug;
  categoryName: string;
  tags: string[];
  targetProduct: TargetProduct;
  status: IPost['status'];
  author: string;
  wordCount: number;
  readingTimeMinutes: number;
  qualityScore: number;
  seo: SeoMeta;
  faq: FaqItem[];
  aiModel: string;
  generationJobId?: string;
  publishedAt: Date | null;
}

export async function createPost(input: CreatePostInput): Promise<PostDTO> {
  await connectToDatabase();
  const doc = await Post.create({ ...input, contentFormat: 'markdown' });
  return toDTO(doc.toObject() as LeanPost);
}

export async function incrementViews(slug: string): Promise<void> {
  await connectToDatabase();
  await Post.updateOne({ slug, status: 'published' }, { $inc: { views: 1 } });
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** True if a post with the same focus keyword or (case-insensitive) title exists. */
export async function isDuplicate(
  focusKeyword: string,
  title: string,
): Promise<boolean> {
  await connectToDatabase();
  const count = await Post.countDocuments({
    $or: [
      { 'seo.focusKeyword': focusKeyword },
      { title: { $regex: `^${escapeRegex(title.trim())}$`, $options: 'i' } },
    ],
  });
  return count > 0;
}

export async function deletePostById(id: string): Promise<string | null> {
  await connectToDatabase();
  const doc = await Post.findByIdAndDelete(id).lean<LeanPost>();
  return doc ? doc.slug : null;
}
