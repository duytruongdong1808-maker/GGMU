import type { Request, Response } from 'express';

import { sendSuccess } from '../../utils/apiResponse.js';
import { matchesService } from './matches.service.js';
import {
  headToHeadQuerySchema,
  matchIdParamsSchema,
  matchListQuerySchema,
  matchSearchQuerySchema,
  recentMatchesQuerySchema,
  upcomingMatchesQuerySchema,
} from './matches.schema.js';

export const matchesController = {
  listMatches: async (request: Request, response: Response) => {
    const query = matchListQuerySchema.parse(request.query);
    const result = await matchesService.listMatches(query);

    return sendSuccess(response, {
      message: 'Matches fetched successfully',
      data: result.data,
      pagination: result.pagination,
    });
  },

  searchMatches: async (request: Request, response: Response) => {
    const query = matchSearchQuerySchema.parse(request.query);
    const result = await matchesService.searchMatches(query);

    return sendSuccess(response, {
      message: 'Match search completed successfully',
      data: result.data,
      pagination: result.pagination,
    });
  },

  getMatchById: async (request: Request, response: Response) => {
    const params = matchIdParamsSchema.parse(request.params);
    const result = await matchesService.getMatchById(params);

    return sendSuccess(response, {
      message: 'Match details fetched successfully',
      data: result,
    });
  },

  getRecentMatches: async (request: Request, response: Response) => {
    const query = recentMatchesQuerySchema.parse(request.query);
    const result = await matchesService.getRecentMatches(query);

    return sendSuccess(response, {
      message: 'Recent matches fetched successfully',
      data: result,
    });
  },

  getUpcomingMatches: async (request: Request, response: Response) => {
    const query = upcomingMatchesQuerySchema.parse(request.query);
    const result = await matchesService.getUpcomingMatches(query);

    return sendSuccess(response, {
      message: 'Upcoming matches fetched successfully',
      data: result,
    });
  },

  getHeadToHead: async (request: Request, response: Response) => {
    const query = headToHeadQuerySchema.parse(request.query);
    const result = await matchesService.getHeadToHead(query);

    return sendSuccess(response, {
      message: 'Head-to-head matches fetched successfully',
      data: result.data,
      pagination: result.pagination,
    });
  },
};
