import { app } from './app.js';
import { env } from './config/env.js';
import { startMatchSyncJob } from './jobs/syncMatches.job.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';

const startServer = async (): Promise<void> => {
  await prisma.$connect();

  app.listen(env.PORT, () => {
    logger.info(`Manchester United backend listening on port ${env.PORT}`);
  });

  startMatchSyncJob();
};

void startServer().catch(async (error) => {
  logger.error('Failed to start backend server', error);
  await prisma.$disconnect();
  process.exit(1);
});
