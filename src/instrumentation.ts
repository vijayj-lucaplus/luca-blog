/**
 * Next.js instrumentation hook. Runs once when the Node.js server boots —
 * the right place to start the in-process node-cron schedulers. Guarded so it
 * only runs in the Node runtime (never Edge).
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startScheduler } = await import('@/lib/scheduler');
    startScheduler();
  }
}
