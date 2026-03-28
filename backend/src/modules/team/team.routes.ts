import { Router } from 'express';

import { asyncHandler } from '../../lib/asyncHandler.js';
import { teamController } from './team.controller.js';

export const teamRouter = Router();

teamRouter.get('/team', asyncHandler(teamController.getTeam));
teamRouter.get('/squad', asyncHandler(teamController.getSquad));
teamRouter.get('/standings', asyncHandler(teamController.getStandings));
