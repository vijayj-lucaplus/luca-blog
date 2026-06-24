import type { NextRequest } from 'next/server';
import { simplePage } from '@/lib/simple-page';
import { unsubscribe } from '@/services/subscriber-service';

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  const done = token ? await unsubscribe(token) : false;

  return done
    ? simplePage('Unsubscribed', 'You will no longer receive emails from the LucaPlus blog.')
    : simplePage('Link not found', 'This unsubscribe link is invalid.', false);
}
