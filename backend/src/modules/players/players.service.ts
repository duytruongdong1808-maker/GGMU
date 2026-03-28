import { HttpError } from '../../lib/httpError.js';
import { buildPaginationMeta } from '../../utils/pagination.js';
import { PlayersRepository } from './players.repository.js';
import type {
  AppearanceSummaryQuery,
  PlayerMatchesParams,
  PlayerMatchesQuery,
  PlayerSearchQuery,
} from './players.schema.js';

type MatchResultValue = 'WIN' | 'DRAW' | 'LOSS';

const matchResultLabels: Record<MatchResultValue, 'win' | 'draw' | 'loss'> = {
  WIN: 'win',
  DRAW: 'draw',
  LOSS: 'loss',
};

export class PlayersService {
  constructor(private readonly repository = new PlayersRepository()) {}

  async searchPlayers(query: PlayerSearchQuery) {
    const result = await this.repository.searchPlayers(query);

    return {
      data: result.items.map((player) => ({
        id: player.id,
        externalApiId: player.externalApiId,
        name: player.name,
        nationality: player.nationality,
        position: player.position,
        photo: player.photo,
        appearances: player._count.matchPlayers,
      })),
      pagination: buildPaginationMeta(result.pagination, result.total),
    };
  }

  async getPlayerMatches(params: PlayerMatchesParams, query: PlayerMatchesQuery) {
    const player = await this.repository.findPlayerById(params.id);

    if (!player) {
      throw new HttpError(404, 'Player not found');
    }

    const result = await this.repository.findPlayerMatches(params.id, query);

    return {
      player: {
        id: player.id,
        name: player.name,
        position: player.position,
        photo: player.photo,
      },
      matches: result.items.map((appearance) => ({
        matchId: appearance.match.id,
        opponent: appearance.match.opponentTeam.name,
        date: appearance.match.matchDate,
        competition: appearance.match.competition.name,
        result: appearance.match.resultForManchesterUnited
          ? matchResultLabels[appearance.match.resultForManchesterUnited]
          : null,
        minutesPlayed: appearance.minutesPlayed,
        goals: appearance.goals,
        assists: appearance.assists,
        rating: appearance.rating,
      })),
      pagination: buildPaginationMeta(result.pagination, result.total),
    };
  }

  async getAppearancesSummary(query: AppearanceSummaryQuery) {
    const result = await this.repository.getAppearancesSummary(query);

    return {
      data: result.items,
      pagination: buildPaginationMeta(result.pagination, result.total),
    };
  }
}

export const playersService = new PlayersService();
