import { createHash, randomBytes } from 'crypto';

/** Opaque random token (hex). Used for confirm/unsubscribe links. */
export function randomToken(bytes = 24): string {
  return randomBytes(bytes).toString('hex');
}

/** SHA-256 hash, for storing confirmation tokens at rest. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
