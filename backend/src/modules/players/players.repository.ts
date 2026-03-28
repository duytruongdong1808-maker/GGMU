import { env } from '../../config/env.js';
import type { NormalizedMatchPlayerInput, NormalizedPlayerInput } from '../../integrations/footballApi/footballApi.mapper.js';
import { prisma, type DatabaseClient } from '../../lib/prisma.js';
import { getPaginationSkip, normalizePagination } from '../../utils/pagination.js';
import type { AppearanceSummaryQuery, PlayerMatchesQuery, PlayerSearchQuery } from './players.schema.js';

export class PlayersRepository {
  constructor(private readonly db: DatabaseClient = prisma) {}

  async upsertPlayer(player: NormalizedPlayerInput) {
    return this.db.player.upsert({
      where: { externalApiId: player.externalApiId },
      create: {
        externalApiId: player.externalApiId,
        name: player.name,
        nationality: player.nationality,
        position: player.position,
        photo: player.photo,
      },
      update: {
        name: player.name,
        nationality: player.nationality,
        position: player.position,
        photo: player.photo,
      },
    });
  }

  async upsertMatchPlayer(matchId: number, playerEntry: NormalizedMatchPlayerInput) {
    const [team, player] = await Promise.all([
      this.db.team.findUniqueOrThrow({
        where: { externalApiId: playerEntry.team.externalApiId },
      }),
      this.upsertPlayer(playerEntry.player),
    ]);

    return this.db.matchPlayer.upsert({
      where: {
        matchId_playerId_teamId: {
          matchId,
          playerId: player.id,
          teamId: team.id,
        },
      },
      create: {
        matchId,
        playerId: player.id,
        teamId: team.id,
        isStarter: playerEntry.isStarter,
        isSubstitute: playerEntry.isSubstitute,
        minutesPlayed: playerEntry.minutesPlayed,
        goals: playerEntry.goals,
        assists: playerEntry.assists,
        shots: playerEntry.shots,
        keyPasses: playerEntry.keyPasses,
        yellowCards: playerEntry.yellowCards,
        redCards: playerEntry.redCards,
        rating: playerEntry.rating,
      },
      update: {
        isStarter: playerEntry.isStarter,
        isSubstitute: playerEntry.isSubstitute,
        minutesPlayed: playerEntry.minutesPlayed,
        goals: playerEntry.goals,
        assists: playerEntry.assists,
        shots: playerEntry.shots,
        keyPasses: playerEntry.keyPasses,
        yellowCards: playerEntry.yellowCards,
        redCards: playerEntry.redCards,
        rating: playerEntry.rating,
      },
    });
  }

  async searchPlayers(query: PlayerSearchQuery) {
    const pagination = normalizePagination(query);
    const where = {
      name: {
        contains: query.name,
        mode: 'insensitive' as const,
      },
    };

    const [items, total] = await Promise.all([
      this.db.player.findMany({
        where,
        orderBy: {
          name: 'asc',
        },
        skip: getPaginationSkip(pagination),
        take: pagination.limit,
        include: {
          _count: {
            select: {
              matchPlayers: true,
            },
          },
        },
      }),
      this.db.player.count({ where }),
    ]);

    return { items, total, pagination };
  }

  async findPlayerById(playerId: number) {
    return this.db.player.findUnique({
      where: { id: playerId },
    });
  }

  async findPlayerMatches(playerId: number, query: PlayerMatchesQuery) {
    const pagination = normalizePagination(query);
    const where = {
      playerId,
      team: {
        externalApiId: env.MANCHESTER_UNITED_TEAM_ID,
      },
      OR: [{ isStarter: true }, { minutesPlayed: { gt: 0 } }],
      ...(query.season || query.competition
        ? {
            match: {
              ...(query.season
                ? {
                    season: {
                      year: query.season,
                    },
                  }
                : {}),
              ...(query.competition
                ? {
                    competition: {
                      name: {
                        contains: query.competition,
                        mode: 'insensitive' as const,
                      },
                    },
                  }
                : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.db.matchPlayer.findMany({
        where,
        include: {
          match: {
            include: {
              competition: true,
              opponentTeam: true,
            },
          },
        },
        orderBy: {
          match: {
            matchDate: 'desc',
          },
        },
        skip: getPaginationSkip(pagination),
        take: pagination.limit,
      }),
      this.db.matchPlayer.count({ where }),
    ]);

    return { items, total, pagination };
  }

  async getAppearancesSummary(query: AppearanceSummaryQuery) {
    const pagination = normalizePagination(query);
    const items = await this.db.matchPlayer.findMany({
      where: {
        team: {
          externalApiId: env.MANCHESTER_UNITED_TEAM_ID,
        },
        OR: [{ isStarter: true }, { minutesPlayed: { gt: 0 } }],
        match: {
          season: {
            year: query.season,
          },
        },
      },
      include: {
        player: true,
      },
      orderBy: {
        player: {
          name: 'asc',
        },
      },
    });

    const summaryMap = new Map<
      number,
      {
        playerId: number;
        name: string;
        position: string | null;
        appearances: number;
        starts: number;
        substituteAppearances: number;
        totalMinutes: number;
        goals: number;
        assists: number;
      }
    >();

    for (const item of items) {
      const current = summaryMap.get(item.playerId) ?? {
        playerId: item.playerId,
        name: item.player.name,
        position: item.player.position,
        appearances: 0,
        starts: 0,
        substituteAppearances: 0,
        totalMinutes: 0,
        goals: 0,
        assists: 0,
      };

      current.appearances += 1;
      current.starts += item.isStarter ? 1 : 0;
      current.substituteAppearances += item.isSubstitute ? 1 : 0;
      current.totalMinutes += item.minutesPlayed ?? 0;
      current.goals += item.goals ?? 0;
      current.assists += item.assists ?? 0;

      summaryMap.set(item.playerId, current);
    }

    const summary = Array.from(summaryMap.values()).sort((left, right) => {
      if (right.appearances !== left.appearances) {
        return right.appearances - left.appearances;
      }

      return right.totalMinutes - left.totalMinutes;
    });

    const paginated = summary.slice(
      getPaginationSkip(pagination),
      getPaginationSkip(pagination) + pagination.limit,
    );

    return {
      items: paginated,
      total: summary.length,
      pagination,
    };
  }
}
