import type { NextRequest } from 'next/server';
import { simplePage } from '@/lib/simple-page';
import { confirmSubscriber } from '@/services/subscriber-service';

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  const confirmed = token ? await confirmSubscriber(token) : false;

  return confirmed
    ? simplePage('Subscription confirmed', 'You are all set — thanks for subscribing to the LucaPlus blog.')
    : simplePage(
        'Link expired',
        'This confirmation link is invalid or has expired. Please subscribe again.',
        false,
      );
}
