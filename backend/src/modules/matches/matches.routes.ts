import { Router } from 'express';

import { asyncHandler } from '../../lib/asyncHandler.js';
import { matchesController } from './matches.controller.js';

export const matchesRouter = Router();

matchesRouter.get('/upcoming', asyncHandler(matchesController.getUpcomingMatches));
matchesRouter.get('/recent', asyncHandler(matchesController.getRecentMatches));
matchesRouter.get('/head-to-head', asyncHandler(matchesController.getHeadToHead));
matchesRouter.get('/search', asyncHandler(matchesController.searchMatches));
matchesRouter.get('/', asyncHandler(matchesController.listMatches));
matchesRouter.get('/:id', asyncHandler(matchesController.getMatchById));
