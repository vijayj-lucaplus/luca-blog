import { SignJWT, jwtVerify } from 'jose';

/**
 * Edge-safe admin session token (signed JWT). This module intentionally only
 * depends on `jose` + process.env so it can run inside proxy.ts (Edge runtime)
 * as well as Node route handlers.
 */
export const SESSION_COOKIE = 'lp_admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

const ALG = 'HS256';

function secretKey(): Uint8Array {
  const secret =
    process.env.SESSION_SECRET ?? 'lucaplus-dev-session-secret-change-me';
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  email: string;
  role: 'admin';
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.role !== 'admin' || typeof payload.email !== 'string') {
      return null;
    }
    return { email: payload.email, role: 'admin' };
  } catch {
    return null;
  }
}
