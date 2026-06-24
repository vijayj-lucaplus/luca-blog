/** Shared domain types for the LucaPlus auto-blog. */

export type CategorySlug =
  | 'invoicing-e-invoicing'
  | 'b2b-credit-cashflow'
  | 'accounting-bookkeeping'
  | 'small-business-fintech';

export type TargetProduct = 'lucaplus' | 'lucapay' | 'both';

export type TagVariant = 'teal' | 'navy' | 'gold' | 'brand';

export type PostStatus = 'draft' | 'published' | 'failed' | 'archived';

export type GenerationJobStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'skipped';

export type GenerationTrigger = 'cron' | 'manual';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SeoMeta {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  keywords: string[];
  focusKeyword?: string;
}

export interface CategoryInfo {
  slug: CategorySlug;
  name: string;
  description: string;
  targetProduct: TargetProduct;
  tagVariant: TagVariant;
}

/** Raw, validated shape returned by the AI writer before persistence. */
export interface GeneratedPost {
  title: string;
  excerpt: string;
  metaDescription: string;
  bodyMarkdown: string;
  tags: string[];
  keywords: string[];
  focusKeyword: string;
  faq: FaqItem[];
}

/** A plain, serialisable post used by pages and components (no Mongoose docs). */
export interface PostDTO {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categorySlug: CategorySlug;
  categoryName: string;
  tags: string[];
  coverImageUrl: string;
  coverImageAlt: string;
  ogImageUrl: string;
  author: string;
  targetProduct: TargetProduct;
  readingTimeMinutes: number;
  wordCount: number;
  qualityScore: number;
  views: number;
  status: PostStatus;
  seo: SeoMeta;
  faq: FaqItem[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QualityCheck {
  name: string;
  passed: boolean;
  detail?: string;
}

export interface ValidationResult {
  passed: boolean;
  checks: QualityCheck[];
}
