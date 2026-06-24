import readingTime from 'reading-time';

/** Computes reading time (minutes, rounded up) and word count from text. */
export function computeReadingTime(text: string): {
  minutes: number;
  words: number;
} {
  const stats = readingTime(text);
  return {
    minutes: Math.max(1, Math.ceil(stats.minutes)),
    words: stats.words,
  };
}
