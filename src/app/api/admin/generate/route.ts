import { NextResponse, type NextRequest } from 'next/server';
import { CATEGORY_BY_SLUG } from '@/config/constants';
import { getCurrentSession } from '@/lib/auth/admin';
import { runGenerationJob } from '@/lib/blog/generation-pipeline';
import type { CategorySlug } from '@/types/blog';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (!(await getCurrentSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { categorySlug?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const requested = body.categorySlug as CategorySlug | undefined;
  const categorySlug =
    requested && CATEGORY_BY_SLUG[requested] ? requested : undefined;

  const result = await runGenerationJob({ trigger: 'manual', categorySlug });
  return NextResponse.json(result);
}
