import pino from 'pino';

/** Shared structured logger. Use instead of console.* in server code. */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: { app: 'lucaplus-blog' },
});
