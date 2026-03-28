import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';
import { syncService } from '../modules/sync/sync.service.js';

const seasonArgument = process.argv.find((argument) => argument.startsWith('--season='));
const seasonValue = seasonArgument ? Number(seasonArgument.split('=')[1]) : Number.NaN;

if (Number.isNaN(seasonValue) || seasonValue <= 0) {
  logger.error('Usage: npm run sync:season -- --season=2025');
  process.exit(1);
}

logger.info('Season sync preflight', {
  season: seasonValue,
  teamId: env.MANCHESTER_UNITED_TEAM_ID,
  provider: env.FOOTBALL_API_PROVIDER,
  baseURL: env.FOOTBALL_API_BASE_URL,
  host: env.FOOTBALL_API_HOST,
  authHeaderName: env.FOOTBALL_API_PROVIDER === 'rapidapi' ? 'x-rapidapi-key' : 'x-apisports-key',
  hostHeaderName: env.FOOTBALL_API_PROVIDER === 'rapidapi' ? 'x-rapidapi-host' : 'none',
  providerExplicit: typeof process.env.FOOTBALL_API_PROVIDER === 'string',
});

void prisma
  .$connect()
  .then(async () => {
    const result = await syncService.syncMatchesBySeason(seasonValue);
    logger.info('Season sync finished successfully', result);
  })
  .catch((error) => {
    logger.error('Season sync failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


