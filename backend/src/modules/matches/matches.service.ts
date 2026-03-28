import { env } from '../../config/env.js';
import { footballApiClient } from '../../integrations/footballApi/footballApi.client.js';
import { mapFixtureToMatch } from '../../integrations/footballApi/footballApi.mapper.js';
import { HttpError } from '../../lib/httpError.js';
import { buildPaginationMeta } from '../../utils/pagination.js';
import { MatchesRepository, type MatchDetailRecord, type MatchListRecord } from './matches.repository.js';
import type {
  HeadToHeadQuery,
  MatchIdParams,
  MatchListQuery,
  MatchSearchQuery,
  RecentMatchesQuery,
  UpcomingMatchesQuery,
} from './matches.schema.js';

type MatchResultValue = 'WIN' | 'DRAW' | 'LOSS';

const matchResultLabels: Record<MatchResultValue, 'win' | 'draw' | 'loss'> = {
  WIN: 'win',
  DRAW: 'draw',
  LOSS: 'loss',
};

interface MatchSummary {
  id: number | null;
  detailAvailable: boolean;
  externalApiId: number;
  date: Date;
  competition: {
    id: number;
    name: string;
    country: string | null;
    logo: string | null;
  };
  season: number;
  venue: string | null;
  status: string;
  homeAway: 'home' | 'away';
  opponent: {
    id: number;
    name: string;
    logo: string | null;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string | null;
    };
    away: {
      id: number;
      name: string;
      logo: string | null;
    };
  };
  score: {
    home: number | null;
    away: number | null;
    manchesterUnited: number | null;
    opponent: number | null;
  };
  result: 'win' | 'draw' | 'loss' | null;
}

const mapMatchSummary = (match: MatchListRecord): MatchSummary => {
  const muScore = match.isManchesterUnitedHome ? match.homeScore : match.awayScore;
  const opponentScore = match.isManchesterUnitedHome ? match.awayScore : match.homeScore;

  return {
    id: match.id,
    detailAvailable: true,
    externalApiId: match.externalApiId,
    date: match.matchDate,
    competition: {
      id: match.competition.id,
      name: match.competition.name,
      country: match.competition.country,
      logo: match.competition.logo,
    },
    season: match.season.year,
    venue: match.venue,
    status: match.status,
    homeAway: match.isManchesterUnitedHome ? 'home' : 'away',
    opponent: {
      id: match.opponentTeam.id,
      name: match.opponentTeam.name,
      logo: match.opponentTeam.logo,
    },
    teams: {
      home: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        logo: match.homeTeam.logo,
      },
      away: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        logo: match.awayTeam.logo,
      },
    },
    score: {
      home: match.homeScore,
      away: match.awayScore,
      manchesterUnited: muScore,
      opponent: opponentScore,
    },
    result: match.resultForManchesterUnited ? matchResultLabels[match.resultForManchesterUnited] : null,
  };
};

const mapLiveUpcomingMatchSummary = (
  fixture: Awaited<ReturnType<typeof footballApiClient.fetchUpcomingFixtures>>[number],
): MatchSummary => {
  const match = mapFixtureToMatch(fixture, env.MANCHESTER_UNITED_TEAM_ID);
  const muScore = match.isManchesterUnitedHome ? match.homeScore : match.awayScore;
  const opponentScore = match.isManchesterUnitedHome ? match.awayScore : match.homeScore;

  return {
    id: null,
    detailAvailable: false,
    externalApiId: match.externalApiId,
    date: match.matchDate,
    competition: {
      id: match.competition.externalApiId,
      name: match.competition.name,
      country: match.competition.country,
      logo: match.competition.logo,
    },
    season: match.seasonYear,
    venue: match.venue,
    status: match.status,
    homeAway: match.isManchesterUnitedHome ? 'home' : 'away',
    opponent: {
      id: match.opponentTeam.externalApiId,
      name: match.opponentTeam.name,
      logo: match.opponentTeam.logo,
    },
    teams: {
      home: {
        id: match.homeTeam.externalApiId,
        name: match.homeTeam.name,
        logo: match.homeTeam.logo,
      },
      away: {
        id: match.awayTeam.externalApiId,
        name: match.awayTeam.name,
        logo: match.awayTeam.logo,
      },
    },
    score: {
      home: match.homeScore,
      away: match.awayScore,
      manchesterUnited: muScore,
      opponent: opponentScore,
    },
    result: match.resultForManchesterUnited ? matchResultLabels[match.resultForManchesterUnited] : null,
  };
};

const dedupeMatchSummaries = (matches: MatchSummary[]): MatchSummary[] => {
  const seenExternalApiIds = new Set<number>();

  return matches.filter((match) => {
    if (seenExternalApiIds.has(match.externalApiId)) {
      return false;
    }

    seenExternalApiIds.add(match.externalApiId);
    return true;
  });
};

const mapLineupPlayers = (match: MatchDetailRecord, starterFlag: boolean, teamExternalApiId: number) =>
  match.matchPlayers
    .filter(
      (playerRecord) =>
        playerRecord.team.externalApiId === teamExternalApiId &&
        (starterFlag ? playerRecord.isStarter : playerRecord.isSubstitute),
    )
    .map((playerRecord) => ({
      id: playerRecord.player.id,
      name: playerRecord.player.name,
      position: playerRecord.player.position,
      photo: playerRecord.player.photo,
    }));

const mapMatchDetail = (match: MatchDetailRecord) => {
  const muTeamExternalApiId = env.MANCHESTER_UNITED_TEAM_ID;
  const opponentExternalApiId = match.opponentTeam.externalApiId;
  const homeStatistics = match.matchStatistic
    ? {
        possession: match.matchStatistic.possessionHome,
        shots: match.matchStatistic.shotsHome,
        shotsOnTarget: match.matchStatistic.shotsOnTargetHome,
        corners: match.matchStatistic.cornersHome,
        fouls: match.matchStatistic.foulsHome,
        yellowCards: match.matchStatistic.yellowCardsHome,
        redCards: match.matchStatistic.redCardsHome,
        offsides: match.matchStatistic.offsidesHome,
        passes: match.matchStatistic.passesHome,
      }
    : null;
  const awayStatistics = match.matchStatistic
    ? {
        possession: match.matchStatistic.possessionAway,
        shots: match.matchStatistic.shotsAway,
        shotsOnTarget: match.matchStatistic.shotsOnTargetAway,
        corners: match.matchStatistic.cornersAway,
        fouls: match.matchStatistic.foulsAway,
        yellowCards: match.matchStatistic.yellowCardsAway,
        redCards: match.matchStatistic.redCardsAway,
        offsides: match.matchStatistic.offsidesAway,
        passes: match.matchStatistic.passesAway,
      }
    : null;

  const muLineup = match.lineups.find((lineup) => lineup.team.externalApiId === muTeamExternalApiId) ?? null;
  const opponentLineup =
    match.lineups.find((lineup) => lineup.team.externalApiId === opponentExternalApiId) ?? null;

  const manchesterUnitedPlayers = match.matchPlayers
    .filter((playerRecord) => playerRecord.team.externalApiId === muTeamExternalApiId)
    .map((playerRecord) => ({
      id: playerRecord.player.id,
      name: playerRecord.player.name,
      position: playerRecord.player.position,
      minutes: playerRecord.minutesPlayed,
      goals: playerRecord.goals,
      assists: playerRecord.assists,
      shots: playerRecord.shots,
      keyPasses: playerRecord.keyPasses,
      rating: playerRecord.rating,
      yellowCards: playerRecord.yellowCards,
      redCards: playerRecord.redCards,
      isStarter: playerRecord.isStarter,
      isSubstitute: playerRecord.isSubstitute,
    }));

  return {
    id: match.id,
    externalApiId: match.externalApiId,
    season: match.season.year,
    basicInfo: {
      date: match.matchDate,
      competition: match.competition.name,
      venue: match.venue,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      score: {
        home: match.homeScore,
        away: match.awayScore,
      },
      status: match.status,
      result: match.resultForManchesterUnited ? matchResultLabels[match.resultForManchesterUnited] : null,
      homeAway: match.isManchesterUnitedHome ? 'home' : 'away',
      opponent: match.opponentTeam.name,
    },
    statistics: {
      home: homeStatistics,
      away: awayStatistics,
      manchesterUnited: match.isManchesterUnitedHome ? homeStatistics : awayStatistics,
      opponent: match.isManchesterUnitedHome ? awayStatistics : homeStatistics,
    },
    lineup: {
      manchesterUnited: {
        formation: muLineup?.formation ?? null,
        coach: muLineup?.coachName ?? null,
        startingXI: mapLineupPlayers(match, true, muTeamExternalApiId),
        substitutes: mapLineupPlayers(match, false, muTeamExternalApiId),
      },
      opponent: {
        formation: opponentLineup?.formation ?? null,
        coach: opponentLineup?.coachName ?? null,
        startingXI: mapLineupPlayers(match, true, opponentExternalApiId),
        substitutes: mapLineupPlayers(match, false, opponentExternalApiId),
      },
    },
    playersWhoPlayed: manchesterUnitedPlayers
      .filter((player) => player.isStarter || (player.minutes ?? 0) > 0)
      .map((player) => ({
        id: player.id,
        name: player.name,
        position: player.position,
      })),
    playerMatchStats: manchesterUnitedPlayers,
  };
};

export class MatchesService {
  constructor(private readonly repository = new MatchesRepository()) {}

  async listMatches(query: MatchListQuery) {
    const result = await this.repository.findMatches(query);

    return {
      data: result.items.map(mapMatchSummary),
      pagination: buildPaginationMeta(result.pagination, result.total),
    };
  }

  async searchMatches(query: MatchSearchQuery) {
    const result = await this.repository.findMatches(query);

    return {
      data: result.items.map(mapMatchSummary),
      pagination: buildPaginationMeta(result.pagination, result.total),
    };
  }

  async getMatchById(params: MatchIdParams) {
    const match = await this.repository.findById(params.id);

    if (!match) {
      throw new HttpError(404, 'Match not found');
    }

    return mapMatchDetail(match);
  }

  async getRecentMatches(query: RecentMatchesQuery) {
    const matches = await this.repository.findRecentMatches(query);
    return matches.map(mapMatchSummary);
  }

  async getUpcomingMatches(query: UpcomingMatchesQuery) {
    const dbMatches = await this.repository.findUpcomingMatches(query);
    const mappedDbMatches = dbMatches.map(mapMatchSummary);

    if (mappedDbMatches.length >= query.limit) {
      return mappedDbMatches;
    }

    try {
      const liveFixtures = await footballApiClient.fetchUpcomingFixtures(query.limit);
      const liveFixtureIds = liveFixtures.map((fixture) => fixture.fixture.id);
      const persistedMatches = await this.repository.findMatchesByExternalApiIds(liveFixtureIds);
      const persistedMatchesByExternalApiId = new Map(
        persistedMatches.map((match) => [match.externalApiId, match] as const),
      );
      const mergedMatches = liveFixtures.map((fixture) => {
        const persistedMatch = persistedMatchesByExternalApiId.get(fixture.fixture.id);
        return persistedMatch ? mapMatchSummary(persistedMatch) : mapLiveUpcomingMatchSummary(fixture);
      });

      return dedupeMatchSummaries([...mappedDbMatches, ...mergedMatches]).slice(0, query.limit);
    } catch (error) {
      if (mappedDbMatches.length > 0) {
        return mappedDbMatches;
      }

      throw error;
    }
  }

  async getHeadToHead(query: HeadToHeadQuery) {
    const result = await this.repository.findHeadToHead(query);

    return {
      data: result.items.map(mapMatchSummary),
      pagination: buildPaginationMeta(result.pagination, result.total),
    };
  }
}

export const matchesService = new MatchesService();

