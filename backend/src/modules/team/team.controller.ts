import type { Request, Response } from 'express';

import { sendSuccess } from '../../utils/apiResponse.js';
import { teamService } from './team.service.js';

export const teamController = {
  getTeam: async (_request: Request, response: Response) => {
    const result = await teamService.getTeam();

    return sendSuccess(response, {
      message: 'Team fetched successfully',
      data: result,
    });
  },

  getSquad: async (_request: Request, response: Response) => {
    const result = await teamService.getSquad();

    return sendSuccess(response, {
      message: 'Squad fetched successfully',
      data: result,
    });
  },

  getStandings: async (_request: Request, response: Response) => {
    const result = await teamService.getStandings();

    return sendSuccess(response, {
      message: 'Standings fetched successfully',
      data: result,
    });
  },
};
