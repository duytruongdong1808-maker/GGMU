import { env } from '../../config/env.js';
import { footballApiClient } from '../../integrations/footballApi/footballApi.client.js';
import { buildNormalizedMatchBundle } from '../../integrations/footballApi/footballApi.mapper.js';
import { HttpError } from '../../lib/httpError.js';
import { logger } from '../../lib/logger.js';
import { prisma } from '../../lib/prisma.js';
import { getRecentSeasonYears } from '../../utils/date.js';
import { MatchesRepository } from '../matches/matches.repository.js';
import { PlayersRepository } from '../players/players.repository.js';

interface SyncSummary {
  season: number;
  processedFixtures: number;
  syncedMatches: number;
}

const SyncStatusValues = {
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const;

export class SyncService {
  private unwrapOptionalApiResult<T>(result: PromiseSettledResult<T>, fallbackValue: T, context: string): T {
    if (result.status === 'fulfilled') {
      return result.value;
    }

    logger.warn(`Optional football API request failed for ${context}`, result.reason);
    return fallbackValue;
  }

  private formatSyncError(error: unknown): unknown {
    if (error instanceof HttpError) {
      return {
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
      };
    }

    return error;
  }

  async syncMatchesBySeason(season: number): Promise<SyncSummary> {
    const syncLog = await prisma.syncLog.create({
      data: {
        type: 'MATCH_SYNC',
        season,
        startedAt: new Date(),
        status: SyncStatusValues.RUNNING,
        message: `Starting match sync for season ${season}`,
      },
    });

    try {
      const fixtures = await footballApiClient.fetchPastFixturesBySeason(season);
      let syncedMatches = 0;

      for (const fixture of fixtures) {
        const details = await footballApiClient.fetchMatchDetails(fixture.fixture.id);
        const [statisticsResult, lineupsResult, playersResult] = await Promise.allSettled([
          footballApiClient.fetchMatchStatistics(fixture.fixture.id),
          footballApiClient.fetchMatchLineups(fixture.fixture.id),
          footballApiClient.fetchMatchPlayers(fixture.fixture.id),
        ]);
        const statistics = this.unwrapOptionalApiResult(
          statisticsResult,
          [],
          `fixture ${fixture.fixture.id} statistics`,
        );
        const lineups = this.unwrapOptionalApiResult(
          lineupsResult,
          [],
          `fixture ${fixture.fixture.id} lineups`,
        );
        const players = this.unwrapOptionalApiResult(
          playersResult,
          [],
          `fixture ${fixture.fixture.id} players`,
        );

        const bundle = buildNormalizedMatchBundle({
          fixture: details,
          statistics,
          lineups,
          players,
          manchesterUnitedTeamId: env.MANCHESTER_UNITED_TEAM_ID,
        });

        await prisma.$transaction(async (transaction) => {
          const matchesRepository = new MatchesRepository(transaction);
          const playersRepository = new PlayersRepository(transaction);
          const matchRecord = await matchesRepository.upsertMatch(bundle.match);

          await matchesRepository.upsertMatchStatistic(matchRecord.id, bundle.statistics);

          for (const lineup of bundle.lineups) {
            await matchesRepository.upsertLineup(matchRecord.id, lineup);
          }

          for (const player of bundle.players) {
            await matchesRepository.upsertTeam(player.team);
            await playersRepository.upsertMatchPlayer(matchRecord.id, player);
          }
        });

        syncedMatches += 1;
      }

      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          finishedAt: new Date(),
          status: SyncStatusValues.SUCCESS,
          message: `Synced ${syncedMatches} matches for season ${season}`,
        },
      });

      return {
        season,
        processedFixtures: fixtures.length,
        syncedMatches,
      };
    } catch (error) {
      logger.error('Match sync failed', this.formatSyncError(error));

      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          finishedAt: new Date(),
          status: SyncStatusValues.FAILED,
          message: error instanceof Error ? error.message : 'Unknown sync error',
        },
      });

      throw error;
    }
  }

  async syncRecentMatches(): Promise<SyncSummary[]> {
    const seasons = getRecentSeasonYears();
    const results: SyncSummary[] = [];

    for (const season of seasons) {
      results.push(await this.syncMatchesBySeason(season));
    }

    return results;
  }
}

export const syncService = new SyncService();
