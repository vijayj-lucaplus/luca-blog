import slugify from 'slugify';

/** Deterministic, URL-safe, length-capped slug from any title. */
export function toSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true }).slice(0, 70);
}
