import { CATEGORIES, TOPIC_BACKLOG, type TopicSeed } from '@/config/constants';
import { focusKeywordExists } from '@/services/post-service';
import type { CategorySlug } from '@/types/blog';

/** Rotates through the four verticals deterministically by day-of-year. */
export function pickCategoryForDate(date: Date): CategorySlug {
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return CATEGORIES[day % CATEGORIES.length].slug;
}

/**
 * Returns the next backlog topic for a category whose focus keyword has not
 * yet been published, or null when the backlog is exhausted (prevents the
 * auto-blog from rewriting the same article).
 */
export async function selectTopic(
  category: CategorySlug,
): Promise<TopicSeed | null> {
  const seeds = TOPIC_BACKLOG[category] ?? [];
  for (const seed of seeds) {
    if (!(await focusKeywordExists(seed.focusKeyword))) {
      return seed;
    }
  }
  return null;
}
