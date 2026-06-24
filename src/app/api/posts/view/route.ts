import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { incrementViews } from '@/services/post-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let body: { slug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const slug = String(body.slug ?? '').trim();
  if (!slug) return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });

  // Light anti-inflation guard per IP + slug.
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimit(`view:${ip}:${slug}`, 5, 60_000).ok) {
    return NextResponse.json({ ok: true });
  }

  try {
    await incrementViews(slug);
  } catch {
    // Non-critical; ignore failures.
  }
  return NextResponse.json({ ok: true });
}
