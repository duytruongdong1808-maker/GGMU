import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { matchesRouter } from './modules/matches/matches.routes.js';
import { playersRouter } from './modules/players/players.routes.js';
import { syncRouter } from './modules/sync/sync.routes.js';
import { teamRouter } from './modules/team/team.routes.js';

export const app = express();

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
  }),
);
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({
    success: true,
    message: 'Manchester United backend is healthy',
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api/matches', matchesRouter);
app.use('/api/players', playersRouter);
app.use('/api/sync', syncRouter);
app.use('/api', teamRouter);

app.use(notFound);
app.use(errorHandler);
