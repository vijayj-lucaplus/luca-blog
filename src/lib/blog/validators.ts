import { ALLOWED_LINK_HOSTS } from '@/config/constants';
import { computeReadingTime } from '@/lib/blog/reading-time';
import { markdownToPlainText } from '@/lib/text';
import type { GeneratedPost, QualityCheck, ValidationResult } from '@/types/blog';

export const MIN_WORDS = 600;
export const MAX_WORDS = 2600;

function extractLinks(markdown: string): string[] {
  const fromMarkdown = Array.from(
    markdown.matchAll(/\]\((https?:\/\/[^)]+)\)/g),
    (m) => m[1],
  );
  const bare = markdown.match(/https?:\/\/[^\s)]+/g) ?? [];
  return Array.from(new Set([...fromMarkdown, ...bare]));
}

function hostAllowed(url: string): boolean {
  try {
    return ALLOWED_LINK_HOSTS.includes(new URL(url).hostname.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Guard chain run before a generated article may be published. Every check
 * must pass for auto-publish; otherwise the post is stored as a draft.
 */
export function validateArticle(article: GeneratedPost): ValidationResult {
  const checks: QualityCheck[] = [];
  const plain = markdownToPlainText(article.bodyMarkdown);
  const { words } = computeReadingTime(plain);

  checks.push({
    name: 'word-count',
    passed: words >= MIN_WORDS && words <= MAX_WORDS,
    detail: `${words} words (allowed ${MIN_WORDS}-${MAX_WORDS})`,
  });

  const links = extractLinks(article.bodyMarkdown);
  const disallowed = links.filter((url) => !hostAllowed(url));
  checks.push({
    name: 'links-allowed',
    passed: disallowed.length === 0,
    detail: disallowed.length ? `disallowed: ${disallowed.join(', ')}` : 'ok',
  });

  checks.push({
    name: 'product-cta',
    passed: links.some(hostAllowed),
    detail: links.some(hostAllowed) ? 'ok' : 'no LucaPlus/LucaPay link found',
  });

  checks.push({
    name: 'disclaimer',
    passed:
      /not (financial|tax|legal)/i.test(plain) ||
      /general information/i.test(plain),
    detail: 'requires a not-advice disclaimer',
  });

  checks.push({
    name: 'has-headings',
    passed: /^##\s+/m.test(article.bodyMarkdown),
  });

  checks.push({
    name: 'no-h1',
    passed: !/^#\s+\S/m.test(article.bodyMarkdown),
    detail: 'body must not contain an H1',
  });

  checks.push({
    name: 'no-placeholder',
    passed: !/(lorem ipsum|\bTODO\b|\[insert|xxxx)/i.test(article.bodyMarkdown),
  });

  checks.push({
    name: 'faq',
    passed: article.faq.length >= 2,
    detail: `${article.faq.length} items`,
  });

  return { passed: checks.every((check) => check.passed), checks };
}

/**
 * Derives a 0-100 quality score from the validation checks (the share that
 * passed). Replaces the second LLM "editor" pass so generation needs only one
 * model call, keeping a run inside the serverless time limit.
 */
export function scoreFromValidation(validation: ValidationResult): number {
  const total = validation.checks.length || 1;
  const passed = validation.checks.filter((check) => check.passed).length;
  return Math.round((passed / total) * 100);
}
