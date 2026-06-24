import { Schema, model, models, type Model } from 'mongoose';
import type {
  CategorySlug,
  FaqItem,
  PostStatus,
  SeoMeta,
  TargetProduct,
} from '@/types/blog';

export interface IPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentFormat: 'markdown';
  coverImageUrl: string;
  coverImageAlt: string;
  ogImageUrl: string;
  categorySlug: CategorySlug;
  categoryName: string;
  tags: string[];
  targetProduct: TargetProduct;
  status: PostStatus;
  author: string;
  wordCount: number;
  readingTimeMinutes: number;
  qualityScore: number;
  views: number;
  seo: SeoMeta;
  faq: FaqItem[];
  aiModel: string;
  generationJobId?: string;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<FaqItem>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false },
);

const seoSchema = new Schema<SeoMeta>(
  {
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    canonicalUrl: { type: String },
    keywords: { type: [String], default: [] },
    focusKeyword: { type: String },
  },
  { _id: false },
);

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    contentFormat: { type: String, default: 'markdown' },
    coverImageUrl: { type: String, required: true },
    coverImageAlt: { type: String, required: true },
    ogImageUrl: { type: String, required: true },
    categorySlug: { type: String, required: true, index: true },
    categoryName: { type: String, required: true },
    tags: { type: [String], default: [] },
    targetProduct: { type: String, default: 'both' },
    status: {
      type: String,
      enum: ['draft', 'published', 'failed', 'archived'],
      default: 'draft',
      index: true,
    },
    author: { type: String, default: 'LucaPlus Editorial Team' },
    wordCount: { type: Number, default: 0 },
    readingTimeMinutes: { type: Number, default: 1 },
    qualityScore: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    seo: { type: seoSchema, required: true },
    faq: { type: [faqSchema], default: [] },
    aiModel: { type: String, default: '' },
    generationJobId: { type: String },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ categorySlug: 1, publishedAt: -1 });

export const Post: Model<IPost> =
  (models.Post as Model<IPost>) ?? model<IPost>('Post', postSchema);
