import { connectToDatabase } from '@/lib/db/mongoose';
import { hashToken, randomToken } from '@/lib/tokens';
import { Subscriber } from '@/models/subscriber';

const CONFIRM_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface SubscribeResult {
  status: 'pending' | 'confirmed';
  confirmToken?: string;
  alreadyConfirmed: boolean;
}

export async function subscribe(
  emailRaw: string,
  source: string,
): Promise<SubscribeResult> {
  await connectToDatabase();
  const email = emailRaw.trim().toLowerCase();

  const existing = await Subscriber.findOne({ email });
  if (existing?.status === 'confirmed') {
    return { status: 'confirmed', alreadyConfirmed: true };
  }

  const confirmRaw = randomToken();
  const unsubscribeToken = existing?.unsubscribeToken ?? randomToken();

  await Subscriber.updateOne(
    { email },
    {
      $set: {
        email,
        status: 'pending',
        confirmToken: hashToken(confirmRaw),
        confirmTokenExpiresAt: new Date(Date.now() + CONFIRM_TTL_MS),
        unsubscribeToken,
        source,
      },
    },
    { upsert: true },
  );

  return { status: 'pending', confirmToken: confirmRaw, alreadyConfirmed: false };
}

export async function confirmSubscriber(rawToken: string): Promise<boolean> {
  await connectToDatabase();
  const subscriber = await Subscriber.findOne({
    confirmToken: hashToken(rawToken),
    confirmTokenExpiresAt: { $gte: new Date() },
  });
  if (!subscriber) return false;

  subscriber.status = 'confirmed';
  subscriber.confirmedAt = new Date();
  subscriber.confirmToken = undefined;
  subscriber.confirmTokenExpiresAt = undefined;
  await subscriber.save();
  return true;
}

export async function unsubscribe(rawToken: string): Promise<boolean> {
  await connectToDatabase();
  const subscriber = await Subscriber.findOne({ unsubscribeToken: rawToken });
  if (!subscriber) return false;

  subscriber.status = 'unsubscribed';
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();
  return true;
}

export async function getRecipients(
  audience: 'all' | 'confirmed',
): Promise<{ email: string; unsubscribeToken: string }[]> {
  await connectToDatabase();
  const query: Record<string, unknown> =
    audience === 'confirmed'
      ? { status: 'confirmed' }
      : { status: { $ne: 'unsubscribed' } };

  const docs = await Subscriber.find(query)
    .select('email unsubscribeToken')
    .lean<{ email: string; unsubscribeToken: string }[]>();

  return docs.map((doc) => ({
    email: doc.email,
    unsubscribeToken: doc.unsubscribeToken,
  }));
}

export async function subscriberCounts(): Promise<{
  confirmed: number;
  pending: number;
  unsubscribed: number;
  total: number;
}> {
  await connectToDatabase();
  const [confirmed, pending, unsubscribed, total] = await Promise.all([
    Subscriber.countDocuments({ status: 'confirmed' }),
    Subscriber.countDocuments({ status: 'pending' }),
    Subscriber.countDocuments({ status: 'unsubscribed' }),
    Subscriber.countDocuments({}),
  ]);
  return { confirmed, pending, unsubscribed, total };
}
