import { CATEGORY_BY_SLUG, COVER_PALETTES } from '@/config/constants';
import type { CategorySlug } from '@/types/blog';

/** Deterministic djb2 string hash (no Math.random — stable per input). */
export function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Same-origin URL for a post's branded SVG cover (served by /api/cover). */
export function coverUrlFor(slug: string, category: CategorySlug): string {
  const params = new URLSearchParams({ c: category, s: slug });
  return `/api/cover?${params.toString()}`;
}

/** Same-origin URL for a post's OG card (served by /api/og as PNG). */
export function ogUrlFor(title: string, categoryName: string): string {
  const params = new URLSearchParams({ title, cat: categoryName });
  return `/api/og?${params.toString()}`;
}

/**
 * Generates a deterministic, on-brand abstract SVG cover. Free, no external
 * API. The motif and palette are chosen from the slug + category so the same
 * post always renders the same image (no layout shift).
 */
export function generateCoverSvg(seed: string, category: CategorySlug): string {
  const palette =
    COVER_PALETTES[category] ?? COVER_PALETTES['small-business-fintech'];
  const categoryName = CATEGORY_BY_SLUG[category]?.name ?? 'LucaPlus';
  const motif = hashString(seed) % 3;

  const motifMarkup =
    motif === 0
      ? `
        <circle cx="980" cy="150" r="220" fill="${palette.accent}" opacity="0.18" />
        <circle cx="1050" cy="120" r="120" fill="#ffffff" opacity="0.10" />
        <circle cx="220" cy="560" r="160" fill="${palette.accent}" opacity="0.14" />
        <circle cx="980" cy="150" r="150" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.25" />`
      : motif === 1
        ? `
        <g opacity="0.20" fill="${palette.accent}">
          <rect x="760" y="430" width="60" height="150" rx="8" />
          <rect x="840" y="360" width="60" height="220" rx="8" />
          <rect x="920" y="280" width="60" height="300" rx="8" />
          <rect x="1000" y="200" width="60" height="380" rx="8" />
        </g>
        <path d="M740 470 L840 400 L920 320 L1060 220" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.35" />`
        : `
        <g opacity="0.18">
          <rect x="820" y="120" width="280" height="380" rx="16" fill="#ffffff" />
          <rect x="860" y="170" width="200" height="14" rx="7" fill="${palette.from}" />
          <rect x="860" y="210" width="160" height="12" rx="6" fill="${palette.to}" />
          <rect x="860" y="250" width="200" height="12" rx="6" fill="${palette.to}" />
          <rect x="860" y="290" width="120" height="12" rx="6" fill="${palette.to}" />
          <circle cx="1000" cy="430" r="34" fill="${palette.accent}" />
          <path d="M986 430 l10 12 l20 -26" fill="none" stroke="#ffffff" stroke-width="5" />
        </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.from}" />
      <stop offset="100%" stop-color="${palette.to}" />
    </linearGradient>
    <pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="2" fill="#ffffff" opacity="0.06" />
    </pattern>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)" />
  <rect width="1200" height="675" fill="url(#dots)" />
  ${motifMarkup}
  <text x="80" y="360" font-family="Montserrat, Arial, sans-serif" font-size="34" font-weight="700" letter-spacing="3" fill="#ffffff" opacity="0.95">LUCA<tspan fill="${palette.accent}">PLUS</tspan></text>
  <text x="80" y="408" font-family="Montserrat, Arial, sans-serif" font-size="22" font-weight="600" fill="#ffffff" opacity="0.85">${escapeXml(categoryName)}</text>
</svg>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
