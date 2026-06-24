import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/config/env';
import { runGenerationJob } from '@/lib/blog/generation-pipeline';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

function authorized(request: NextRequest): boolean {
  const header = request.headers.get('authorization');
  const bearer = header?.replace(/^Bearer\s+/i, '');
  const querySecret = new URL(request.url).searchParams.get('secret');
  return bearer === env.CRON_SECRET || querySecret === env.CRON_SECRET;
}

async function handle(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await runGenerationJob({ trigger: 'cron' });
  const httpStatus = result.status === 'failed' ? 500 : 200;
  return NextResponse.json(result, { status: httpStatus });
}

export async function POST(request: NextRequest) {
  return handle(request);
}

export async function GET(request: NextRequest) {
  return handle(request);
}
