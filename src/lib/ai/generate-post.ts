import { z } from 'zod';
import { chat } from '@/lib/ai/nim-client';
import { parseLenientJson } from '@/lib/ai/parse-json';
import { buildWriterMessages } from '@/lib/ai/prompts';
import { markdownToPlainText, truncate } from '@/lib/text';
import type { CategoryInfo, GeneratedPost } from '@/types/blog';

/**
 * Lenient FAQ parse: keep only plausibly-complete entries and never throw on a
 * short or missing FAQ. Publish-quality (>= 2 FAQ items, length, disclaimer,
 * allowed links) is enforced later by validateArticle — so a weak result is
 * saved as a draft instead of discarding the whole article.
 */
const faqItems = z
  .array(z.object({ question: z.string(), answer: z.string() }))
  .catch([])
  .transform((items) =>
    items.filter(
      (item) => item.question.trim().length >= 3 && item.answer.trim().length >= 10,
    ),
  );

/**
 * Deliberately forgiving: only the body is hard-required (without it there is no
 * article). Everything else is coerced or backfilled below, so a single
 * imperfect field never throws away an otherwise-usable post.
 */
const generatedSchema = z.object({
  title: z.string().catch(''),
  excerpt: z.string().catch(''),
  metaDescription: z.string().catch(''),
  bodyMarkdown: z.string().min(200),
  tags: z.array(z.string()).catch([]),
  keywords: z.array(z.string()).catch([]),
  focusKeyword: z.string().catch(''),
  faq: faqItems,
});

/**
 * Parses the writer's delimited response: one-line JSON metadata between
 * ---META--- and ---BODY---, then raw Markdown between ---BODY--- and ---END---.
 * Keeping the long Markdown out of the JSON avoids fragile string escaping.
 */
function parseWriterResponse(raw: string): unknown {
  const metaMatch = raw.match(/---META---([\s\S]*?)---BODY---/i);
  const bodyMatch = raw.match(/---BODY---([\s\S]*?)(?:---END---|$)/i);
  if (!metaMatch || !bodyMatch) {
    throw new Error('Writer response missing ---META---/---BODY--- markers');
  }
  const meta = parseLenientJson(metaMatch[1]) as Record<string, unknown>;
  return { ...meta, bodyMarkdown: bodyMatch[1].trim() };
}

export interface GenerateArticleResult {
  article: GeneratedPost;
  tokensIn: number;
  tokensOut: number;
}

/**
 * Single NIM call that writes a full article, then backfills any missing
 * metadata so a usable article is always returned. Quality gating (and the
 * draft-vs-publish decision) happens downstream in validateArticle.
 */
export async function generateArticle(params: {
  topicTitle: string;
  focusKeyword: string;
  angle: string;
  category: CategoryInfo;
}): Promise<GenerateArticleResult> {
  const messages = buildWriterMessages(params);
  const result = await chat(messages, {
    temperature: 0.6,
    maxTokens: 2048,
    timeoutMs: 240_000,
  });

  const parsed = generatedSchema.parse(parseWriterResponse(result.content));

  const bodyPlain = markdownToPlainText(parsed.bodyMarkdown);
  const excerpt = parsed.excerpt.trim() || truncate(bodyPlain, 200);
  const article: GeneratedPost = {
    title: parsed.title.trim() || params.topicTitle,
    excerpt,
    metaDescription: parsed.metaDescription.trim() || truncate(excerpt, 160),
    bodyMarkdown: parsed.bodyMarkdown,
    tags: parsed.tags,
    keywords: parsed.keywords,
    focusKeyword: parsed.focusKeyword.trim() || params.focusKeyword,
    faq: parsed.faq,
  };

  return {
    article,
    tokensIn: result.tokensIn,
    tokensOut: result.tokensOut,
  };
}
