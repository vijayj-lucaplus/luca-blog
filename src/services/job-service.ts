import { connectToDatabase } from '@/lib/db/mongoose';
import { GenerationJob } from '@/models/generation-job';

/**
 * A generation job still `running` past this window is treated as dead. On
 * serverless hosts the function is hard-killed at its time limit mid-await, so
 * the pipeline's own catch never runs and the job is orphaned in `running`.
 */
const STALE_RUNNING_JOB_MS = 3 * 60 * 1000;

/**
 * Flips orphaned `running` jobs to `failed`. Idempotent and cheap, so it is
 * safe to call from any read path (e.g. the admin dashboard) — stuck jobs then
 * self-heal without needing a background worker.
 *
 * @returns the number of jobs reaped.
 */
export async function reapStaleJobs(): Promise<number> {
  await connectToDatabase();
  const cutoff = new Date(Date.now() - STALE_RUNNING_JOB_MS);
  const result = await GenerationJob.updateMany(
    { status: 'running', startedAt: { $lt: cutoff } },
    {
      $set: {
        status: 'failed',
        error:
          'Timed out — generation exceeded the host time limit and the process was terminated before it could finish.',
        finishedAt: new Date(),
      },
    },
  );
  return result.modifiedCount ?? 0;
}
