import { CATEGORY_BY_SLUG } from '@/config/constants';
import { generateCoverSvg } from '@/lib/images/cover';
import type { CategorySlug } from '@/types/blog';

const FALLBACK: CategorySlug = 'small-business-fintech';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requested = searchParams.get('c') as CategorySlug | null;
  const seed = searchParams.get('s') ?? 'lucaplus';
  const category = requested && CATEGORY_BY_SLUG[requested] ? requested : FALLBACK;

  const svg = generateCoverSvg(seed, category);

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
