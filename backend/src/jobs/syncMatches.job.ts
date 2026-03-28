import cron from 'node-cron';

import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { syncService } from '../modules/sync/sync.service.js';

let syncTask: cron.ScheduledTask | null = null;

export const startMatchSyncJob = (): void => {
  if (!env.MATCH_SYNC_ENABLED) {
    logger.info('Match sync cron is disabled by configuration');
    return;
  }

  if (syncTask) {
    return;
  }

  syncTask = cron.schedule(env.MATCH_SYNC_CRON, async () => {
    logger.info('Running scheduled Manchester United match sync');

    try {
      await syncService.syncRecentMatches();
      logger.info('Scheduled match sync completed');
    } catch (error) {
      logger.error('Scheduled match sync failed', error);
    }
  });

  logger.info(`Scheduled match sync job with cron expression "${env.MATCH_SYNC_CRON}"`);
};
