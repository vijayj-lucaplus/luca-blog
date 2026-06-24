import { revalidatePath } from 'next/cache';
import { CATEGORY_BY_SLUG, SITE } from '@/config/constants';
import { env, isNimConfigured } from '@/config/env';
import { generateArticle } from '@/lib/ai/generate-post';
import { computeReadingTime } from '@/lib/blog/reading-time';
import { toSlug } from '@/lib/blog/slug';
import { pickCategoryForDate, selectTopic } from '@/lib/blog/topic-queue';
import { scoreFromValidation, validateArticle } from '@/lib/blog/validators';
import { connectToDatabase } from '@/lib/db/mongoose';
import { coverUrlFor, ogUrlFor } from '@/lib/images/cover';
import { logger } from '@/lib/logger';
import { markdownToPlainText, truncate } from '@/lib/text';
import { GenerationJob } from '@/models/generation-job';
import { reapStaleJobs } from '@/services/job-service';
import { createPost, isDuplicate, slugExists } from '@/services/post-service';
import type { CategorySlug, GenerationTrigger } from '@/types/blog';

export interface RunGenerationOptions {
  trigger: GenerationTrigger;
  categorySlug?: CategorySlug;
  date?: Date;
}

export interface RunGenerationResult {
  status: 'succeeded' | 'failed' | 'skipped';
  jobId?: string;
  postSlug?: string;
  published?: boolean;
  score?: number;
  message: string;
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function uniqueSlug(base: string): Promise<string> {
  const root = base || 'post';
  let candidate = root;
  let n = 2;
  while (await slugExists(candidate)) {
    candidate = `${root}-${n}`;
    n += 1;
    if (n > 50) {
      candidate = `${root}-${Date.now()}`;
      break;
    }
  }
  return candidate;
}

/** revalidatePath only works inside a request; ignore failures (cron context). */
function safeRevalidate(slug: string, categorySlug: string): void {
  try {
    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    revalidatePath(`/category/${categorySlug}`);
  } catch (error) {
    logger.warn(
      { err: String(error) },
      'revalidatePath skipped (no request context); ISR window will refresh',
    );
  }
}

/**
 * Full generate → validate → editor-score → publish/draft pipeline. Idempotent
 * per scheduled slot via the GenerationJob.runKey unique index.
 */
export async function runGenerationJob(
  options: RunGenerationOptions,
): Promise<RunGenerationResult> {
  await connectToDatabase();
  await reapStaleJobs();

  if (!env.BLOG_GENERATION_ENABLED) {
    return { status: 'skipped', message: 'Generation disabled (BLOG_GENERATION_ENABLED=false).' };
  }
  if (!isNimConfigured()) {
    return { status: 'skipped', message: 'NVIDIA_API_KEY not set; skipping generation.' };
  }

  const date = options.date ?? new Date();
  const category = options.categorySlug
    ? CATEGORY_BY_SLUG[options.categorySlug]
    : CATEGORY_BY_SLUG[pickCategoryForDate(date)];

  const runKey =
    options.trigger === 'cron'
      ? `${dateKey(date)}-${category.slug}`
      : `manual-${category.slug}-${Date.now()}`;

  let job;
  try {
    job = await GenerationJob.create({
      runKey,
      status: 'running',
      trigger: options.trigger,
      categorySlug: category.slug,
      model: env.NIM_MODEL,
      startedAt: new Date(),
      validationChecks: [],
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return { status: 'skipped', message: `Already generated for slot ${runKey}.` };
    }
    throw error;
  }

  const startedAt = Date.now();
  try {
    const topic = await selectTopic(category.slug);
    if (!topic) {
      await job.updateOne({
        status: 'skipped',
        error: 'Topic backlog exhausted for category.',
        finishedAt: new Date(),
        durationMs: Date.now() - startedAt,
      });
      return {
        status: 'skipped',
        jobId: String(job._id),
        message: `Topic backlog exhausted for ${category.name}.`,
      };
    }

    await job.updateOne({ focusKeyword: topic.focusKeyword, topicTitle: topic.title });

    const generated = await generateArticle({
      topicTitle: topic.title,
      focusKeyword: topic.focusKeyword,
      angle: topic.angle,
      category,
    });
    const { article } = generated;

    const validation = validateArticle(article);
    const score = scoreFromValidation(validation);

    if (await isDuplicate(topic.focusKeyword, article.title)) {
      await job.updateOne({
        status: 'skipped',
        error: 'Duplicate topic or title already exists.',
        finishedAt: new Date(),
        durationMs: Date.now() - startedAt,
      });
      return {
        status: 'skipped',
        jobId: String(job._id),
        message: `Skipped duplicate: "${article.title}" already exists.`,
      };
    }

    const shouldPublish =
      validation.passed && score >= env.BLOG_AUTOPUBLISH_MIN_SCORE;

    const slug = await uniqueSlug(toSlug(article.title));
    const plain = markdownToPlainText(article.bodyMarkdown);
    const { minutes, words } = computeReadingTime(plain);

    const post = await createPost({
      title: article.title,
      slug,
      excerpt: truncate(article.excerpt, 280),
      content: article.bodyMarkdown,
      coverImageUrl: coverUrlFor(slug, category.slug),
      coverImageAlt: `${category.name} illustration for ${article.title}`,
      ogImageUrl: ogUrlFor(article.title, category.name),
      categorySlug: category.slug,
      categoryName: category.name,
      tags: article.tags,
      targetProduct: category.targetProduct,
      status: shouldPublish ? 'published' : 'draft',
      author: SITE.author,
      wordCount: words,
      readingTimeMinutes: minutes,
      qualityScore: score,
      seo: {
        metaTitle: truncate(article.title, 65),
        metaDescription: truncate(article.metaDescription, 160),
        canonicalUrl: `${env.SITE_URL}/blog/${slug}`,
        keywords: article.keywords,
        focusKeyword: topic.focusKeyword,
      },
      faq: article.faq,
      aiModel: env.NIM_MODEL,
      generationJobId: String(job._id),
      publishedAt: shouldPublish ? new Date() : null,
    });

    await job.updateOne({
      status: 'succeeded',
      postId: post.id,
      postSlug: slug,
      qualityScore: score,
      validationPassed: validation.passed,
      validationChecks: validation.checks,
      tokensIn: generated.tokensIn,
      tokensOut: generated.tokensOut,
      finishedAt: new Date(),
      durationMs: Date.now() - startedAt,
    });

    if (shouldPublish) safeRevalidate(slug, category.slug);

    const failedChecks = validation.checks
      .filter((check) => !check.passed)
      .map((check) => (check.detail ? `${check.name} (${check.detail})` : check.name));

    logger.info(
      { slug, published: shouldPublish, score, words, failedChecks },
      'Generation job completed',
    );

    let message: string;
    if (shouldPublish) {
      message = `Published "${article.title}" (score ${score}).`;
    } else if (!validation.passed) {
      message = `Saved draft "${article.title}" (score ${score}) — validation failed: ${failedChecks.join('; ')}.`;
    } else {
      message = `Saved draft "${article.title}" (score ${score}; below publish threshold ${env.BLOG_AUTOPUBLISH_MIN_SCORE}).`;
    }

    return {
      status: 'succeeded',
      jobId: String(job._id),
      postSlug: slug,
      published: shouldPublish,
      score,
      message,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await job.updateOne({
      status: 'failed',
      error: message,
      finishedAt: new Date(),
      durationMs: Date.now() - startedAt,
    });
    logger.error({ err: message }, 'Generation job failed');
    return { status: 'failed', jobId: String(job._id), message };
  }
}
