import type { Request, Response } from 'express';

import { sendSuccess } from '../../utils/apiResponse.js';
import { playersService } from './players.service.js';
import {
  appearanceSummaryQuerySchema,
  playerMatchesParamsSchema,
  playerMatchesQuerySchema,
  playerSearchQuerySchema,
} from './players.schema.js';

export const playersController = {
  searchPlayers: async (request: Request, response: Response) => {
    const query = playerSearchQuerySchema.parse(request.query);
    const result = await playersService.searchPlayers(query);

    return sendSuccess(response, {
      message: 'Players fetched successfully',
      data: result.data,
      pagination: result.pagination,
    });
  },

  getPlayerMatches: async (request: Request, response: Response) => {
    const params = playerMatchesParamsSchema.parse(request.params);
    const query = playerMatchesQuerySchema.parse(request.query);
    const result = await playersService.getPlayerMatches(params, query);

    return sendSuccess(response, {
      message: 'Player matches fetched successfully',
      data: {
        player: result.player,
        matches: result.matches,
      },
      pagination: result.pagination,
    });
  },

  getAppearancesSummary: async (request: Request, response: Response) => {
    const query = appearanceSummaryQuerySchema.parse(request.query);
    const result = await playersService.getAppearancesSummary(query);

    return sendSuccess(response, {
      message: 'Appearances summary fetched successfully',
      data: result.data,
      pagination: result.pagination,
    });
  },
};
