/** Lightweight text helpers shared across generation, SEO and email. */

/** Strips common Markdown syntax to produce readable plain text. */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_>#~]/g, '')
    .replace(/\r/g, '')
    .replace(/\n{2,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/** Truncates to a max length on a word boundary, adding an ellipsis. */
export function truncate(input: string, max: number): string {
  const clean = input.trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trim()}…`;
}

/** Escapes a string for safe interpolation inside a JSON-LD <script> tag. */
export function escapeJsonLd(value: string): string {
  return value.replace(/</g, '\\u003c');
}

/** Minimal HTML-escape for text injected into generated email HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
