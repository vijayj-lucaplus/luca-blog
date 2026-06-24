import { z } from 'zod';
import { chat } from '@/lib/ai/nim-client';
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
 * article). Everything else is coerced or backfilled, so a single imperfect
 * field never throws away an otherwise-usable post.
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
 * Splits the marker-delimited head (everything before ---BODY---) into named
 * sections. Markers look like `---TITLE---`; content runs to the next marker.
 */
function splitSections(head: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const markers = [...head.matchAll(/---([A-Z]+)---/g)];
  markers.forEach((marker, index) => {
    const start = (marker.index ?? 0) + marker[0].length;
    const end =
      index + 1 < markers.length ? markers[index + 1].index ?? head.length : head.length;
    sections[marker[1].toUpperCase()] = head.slice(start, end).trim();
  });
  return sections;
}

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,\n]/)
    .map((item) => item.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);
}

function parseFaq(value: string | undefined): { question: string; answer: string }[] {
  if (!value) return [];
  const items: { question: string; answer: string }[] = [];
  const pattern = /Q:\s*([\s\S]*?)\s*A:\s*([\s\S]*?)(?=\n\s*Q:|$)/gi;
  for (const match of value.matchAll(pattern)) {
    const question = match[1].trim();
    const answer = match[2].trim();
    if (question && answer) items.push({ question, answer });
  }
  return items;
}

/**
 * Parses the writer's flat, marker-delimited response (NO JSON). The body is
 * extracted by its own markers first so Markdown inside it (e.g. a `---` rule)
 * can never be mistaken for a metadata marker; the head is then split by field.
 */
function parseWriterResponse(raw: string): unknown {
  const bodyMatch = raw.match(/---BODY---([\s\S]*?)(?:---END---|$)/i);
  if (!bodyMatch) {
    throw new Error('Writer response missing ---BODY--- section');
  }
  const sections = splitSections(raw.slice(0, bodyMatch.index ?? 0));

  return {
    title: sections.TITLE ?? '',
    excerpt: sections.EXCERPT ?? '',
    metaDescription: sections.METADESCRIPTION ?? '',
    bodyMarkdown: bodyMatch[1].trim(),
    tags: splitList(sections.TAGS),
    keywords: splitList(sections.KEYWORDS),
    focusKeyword: sections.FOCUSKEYWORD ?? '',
    faq: parseFaq(sections.FAQ),
  };
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
