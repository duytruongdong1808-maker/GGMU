import { Router } from 'express';

import { asyncHandler } from '../../lib/asyncHandler.js';
import { playersController } from './players.controller.js';

export const playersRouter = Router();

playersRouter.get('/search', asyncHandler(playersController.searchPlayers));
playersRouter.get('/appearances-summary', asyncHandler(playersController.getAppearancesSummary));
playersRouter.get('/:id/matches', asyncHandler(playersController.getPlayerMatches));
