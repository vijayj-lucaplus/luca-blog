import { z } from 'zod';
import { chat } from '@/lib/ai/nim-client';
import { parseLenientJson } from '@/lib/ai/parse-json';
import { buildWriterMessages } from '@/lib/ai/prompts';
import type { CategoryInfo, GeneratedPost } from '@/types/blog';

const faqSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(10),
});

const generatedSchema = z.object({
  title: z.string().min(8).max(160),
  excerpt: z.string().min(20).max(500),
  metaDescription: z.string().min(20).max(260),
  bodyMarkdown: z.string().min(400),
  tags: z.array(z.string().min(2)).min(2).max(10),
  keywords: z.array(z.string().min(2)).min(1).max(15),
  focusKeyword: z.string().min(2),
  faq: z.array(faqSchema).min(2).max(6),
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
 * Single NIM call that writes a full article. Bounded by a per-call timeout and
 * a modest token cap so the whole generate-and-publish pipeline finishes inside
 * the serverless function time limit — one fast call, no second editor pass.
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
  const parsed = generatedSchema.parse(parseWriterResponse(result.content)) as GeneratedPost;
  return {
    article: parsed,
    tokensIn: result.tokensIn,
    tokensOut: result.tokensOut,
  };
}
