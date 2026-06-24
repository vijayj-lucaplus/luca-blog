import * as cron from 'node-cron';
import { env } from '@/config/env';
import { runGenerationJob } from '@/lib/blog/generation-pipeline';
import { logger } from '@/lib/logger';
import { processDueCampaigns } from '@/services/campaign-service';

/**
 * Starts the in-process schedulers (node-cron). Guarded on the global object so
 * hot-reload / repeated instrumentation calls never start duplicate jobs.
 */
export function startScheduler(): void {
  const globalForScheduler = globalThis as unknown as {
    __lpSchedulerStarted?: boolean;
  };
  if (globalForScheduler.__lpSchedulerStarted) return;
  globalForScheduler.__lpSchedulerStarted = true;

  if (cron.validate(env.CRON_SCHEDULE)) {
    cron.schedule(env.CRON_SCHEDULE, () => {
      runGenerationJob({ trigger: 'cron' })
        .then((result) => logger.info({ result }, 'Scheduled generation finished'))
        .catch((error) =>
          logger.error({ err: String(error) }, 'Scheduled generation crashed'),
        );
    });
    logger.info({ schedule: env.CRON_SCHEDULE }, 'Generation scheduler started');
  } else {
    logger.error(
      { schedule: env.CRON_SCHEDULE },
      'Invalid CRON_SCHEDULE; generation scheduler not started',
    );
  }

  if (cron.validate(env.CAMPAIGN_SCHEDULE)) {
    cron.schedule(env.CAMPAIGN_SCHEDULE, () => {
      processDueCampaigns()
        .then((count) => {
          if (count > 0) logger.info({ processed: count }, 'Processed scheduled campaigns');
        })
        .catch((error) =>
          logger.error({ err: String(error) }, 'Campaign scheduler crashed'),
        );
    });
    logger.info({ schedule: env.CAMPAIGN_SCHEDULE }, 'Campaign scheduler started');
  }
}
