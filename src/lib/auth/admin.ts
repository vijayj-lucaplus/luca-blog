import { timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { env } from '@/config/env';
import {
  SESSION_COOKIE,
  verifySessionToken,
  type SessionPayload,
} from '@/lib/auth/session';

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

/** Constant-time check of admin credentials against env values. */
export function verifyCredentials(email: string, password: string): boolean {
  return (
    safeEqual(email.trim().toLowerCase(), env.ADMIN_EMAIL) &&
    safeEqual(password, env.ADMIN_PASSWORD)
  );
}

/** Reads and verifies the current admin session from the request cookies. */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
