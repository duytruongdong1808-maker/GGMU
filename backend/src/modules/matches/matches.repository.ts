import { env } from '../../config/env.js';
import type {
  NormalizedCompetitionInput,
  NormalizedLineupInput,
  NormalizedMatchInput,
  NormalizedMatchStatisticInput,
  NormalizedTeamInput,
} from '../../integrations/footballApi/footballApi.mapper.js';
import { prisma, type DatabaseClient } from '../../lib/prisma.js';
import { toEndOfDay, toStartOfDay } from '../../utils/date.js';
import { getPaginationSkip, normalizePagination } from '../../utils/pagination.js';
import type {
  HeadToHeadQuery,
  MatchListQuery,
  MatchSearchQuery,
  RecentMatchesQuery,
  UpcomingMatchesQuery,
} from './matches.schema.js';

type MatchResultValue = 'WIN' | 'DRAW' | 'LOSS';

type MatchFilters = MatchListQuery | MatchSearchQuery;

const matchListInclude = {
  competition: true,
  homeTeam: true,
  awayTeam: true,
  opponentTeam: true,
  season: true,
} as const;

export class MatchesRepository {
  constructor(private readonly db: DatabaseClient = prisma) {}

  async upsertTeam(team: NormalizedTeamInput) {
    return this.db.team.upsert({
      where: { externalApiId: team.externalApiId },
      create: {
        externalApiId: team.externalApiId,
        name: team.name,
        shortName: team.shortName,
        logo: team.logo,
      },
      update: {
        name: team.name,
        shortName: team.shortName,
        logo: team.logo,
      },
    });
  }

  async upsertCompetition(competition: NormalizedCompetitionInput) {
    return this.db.competition.upsert({
      where: { externalApiId: competition.externalApiId },
      create: {
        externalApiId: competition.externalApiId,
        name: competition.name,
        country: competition.country,
        logo: competition.logo,
      },
      update: {
        name: competition.name,
        country: competition.country,
        logo: competition.logo,
      },
    });
  }

  async upsertSeason(year: number) {
    return this.db.season.upsert({
      where: { year },
      create: { year },
      update: {},
    });
  }

  async upsertMatch(match: NormalizedMatchInput) {
    const season = await this.upsertSeason(match.seasonYear);
    const competition = await this.upsertCompetition(match.competition);
    const homeTeam = await this.upsertTeam(match.homeTeam);
    const awayTeam = await this.upsertTeam(match.awayTeam);
    const opponentTeam = await this.upsertTeam(match.opponentTeam);

    return this.db.match.upsert({
      where: { externalApiId: match.externalApiId },
      create: {
        externalApiId: match.externalApiId,
        seasonId: season.id,
        competitionId: competition.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        opponentTeamId: opponentTeam.id,
        venue: match.venue,
        matchDate: match.matchDate,
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        isManchesterUnitedHome: match.isManchesterUnitedHome,
        resultForManchesterUnited: match.resultForManchesterUnited,
      },
      update: {
        seasonId: season.id,
        competitionId: competition.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        opponentTeamId: opponentTeam.id,
        venue: match.venue,
        matchDate: match.matchDate,
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        isManchesterUnitedHome: match.isManchesterUnitedHome,
        resultForManchesterUnited: match.resultForManchesterUnited,
      },
    });
  }

  async upsertMatchStatistic(matchId: number, statistics: NormalizedMatchStatisticInput | null) {
    if (!statistics) {
      return null;
    }

    return this.db.matchStatistic.upsert({
      where: { matchId },
      create: {
        matchId,
        ...statistics,
      },
      update: statistics,
    });
  }

  async upsertLineup(matchId: number, lineup: NormalizedLineupInput) {
    const team = await this.upsertTeam(lineup.team);

    return this.db.lineup.upsert({
      where: {
        matchId_teamId: {
          matchId,
          teamId: team.id,
        },
      },
      create: {
        matchId,
        teamId: team.id,
        formation: lineup.formation,
        coachName: lineup.coachName,
      },
      update: {
        formation: lineup.formation,
        coachName: lineup.coachName,
      },
    });
  }

  private buildWhere(filters: MatchFilters) {
    const andConditions: Array<Record<string, unknown>> = [];

    if (filters.season) {
      andConditions.push({
        season: {
          year: filters.season,
        },
      });
    }

    if (filters.competition) {
      andConditions.push({
        competition: {
          name: {
            contains: filters.competition,
            mode: 'insensitive',
          },
        },
      });
    }

    if (filters.result) {
      andConditions.push({
        resultForManchesterUnited: filters.result.toUpperCase() as MatchResultValue,
      });
    }

    if (filters.homeAway) {
      andConditions.push({
        isManchesterUnitedHome: filters.homeAway === 'home',
      });
    }

    if (filters.fromDate || filters.toDate) {
      andConditions.push({
        matchDate: {
          ...(filters.fromDate ? { gte: toStartOfDay(filters.fromDate) } : {}),
          ...(filters.toDate ? { lte: toEndOfDay(filters.toDate) } : {}),
        },
      });
    }

    if ('opponent' in filters && filters.opponent) {
      andConditions.push({
        opponentTeam: {
          name: {
            contains: filters.opponent,
            mode: 'insensitive',
          },
        },
      });
    }

    if ('player' in filters && filters.player) {
      andConditions.push({
        matchPlayers: {
          some: {
            team: {
              externalApiId: env.MANCHESTER_UNITED_TEAM_ID,
            },
            OR: [{ isStarter: true }, { minutesPlayed: { gt: 0 } }],
            player: {
              name: {
                contains: filters.player,
                mode: 'insensitive',
              },
            },
          },
        },
      });
    }

    if ('keyword' in filters && filters.keyword) {
      andConditions.push({
        OR: [
          {
            opponentTeam: {
              name: {
                contains: filters.keyword,
                mode: 'insensitive',
              },
            },
          },
          {
            competition: {
              name: {
                contains: filters.keyword,
                mode: 'insensitive',
              },
            },
          },
          {
            venue: {
              contains: filters.keyword,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    return andConditions.length > 0 ? { AND: andConditions } : {};
  }

  private buildOrderBy(sort: MatchFilters['sort']) {
    if (sort === 'oldest') {
      return [{ matchDate: 'asc' as const }];
    }

    if (sort === 'competition') {
      return [{ competition: { name: 'asc' as const } }, { matchDate: 'desc' as const }];
    }

    return [{ matchDate: 'desc' as const }];
  }

  async findMatches(filters: MatchFilters) {
    const pagination = normalizePagination(filters);
    const where = this.buildWhere(filters);
    const [items, total] = await Promise.all([
      this.db.match.findMany({
        where,
        include: matchListInclude,
        skip: getPaginationSkip(pagination),
        take: pagination.limit,
        orderBy: this.buildOrderBy(filters.sort),
      }),
      this.db.match.count({ where }),
    ]);

    return { items, total, pagination };
  }

  async findById(matchId: number) {
    return this.db.match.findUnique({
      where: { id: matchId },
      include: {
        competition: true,
        season: true,
        homeTeam: true,
        awayTeam: true,
        opponentTeam: true,
        matchStatistic: true,
        lineups: {
          include: {
            team: true,
          },
        },
        matchPlayers: {
          include: {
            player: true,
            team: true,
          },
          orderBy: [
            { isStarter: 'desc' },
            { minutesPlayed: 'desc' },
            { player: { name: 'asc' } },
          ],
        },
      },
    });
  }

  async findRecentMatches(query: RecentMatchesQuery) {
    const limit = Math.min(query.limit, 20);
    const now = new Date();

    return this.db.match.findMany({
      where: {
        matchDate: {
          lt: now,
        },
      },
      include: matchListInclude,
      orderBy: {
        matchDate: 'desc',
      },
      take: limit,
    });
  }

  async findUpcomingMatches(query: UpcomingMatchesQuery) {
    const limit = Math.min(query.limit, 20);
    const now = new Date();

    return this.db.match.findMany({
      where: {
        matchDate: {
          gte: now,
        },
      },
      include: matchListInclude,
      orderBy: {
        matchDate: 'asc',
      },
      take: limit,
    });
  }

  async findMatchesByExternalApiIds(externalApiIds: number[]) {
    if (externalApiIds.length === 0) {
      return [];
    }

    return this.db.match.findMany({
      where: {
        externalApiId: {
          in: externalApiIds,
        },
      },
      include: matchListInclude,
    });
  }

  async findHeadToHead(query: HeadToHeadQuery) {
    return this.findMatches({
      page: query.page,
      limit: query.limit,
      opponent: query.opponent,
      sort: 'newest',
    });
  }
}

export type MatchListRecord = Awaited<ReturnType<MatchesRepository['findRecentMatches']>>[number];
export type MatchDetailRecord = NonNullable<Awaited<ReturnType<MatchesRepository['findById']>>>;
