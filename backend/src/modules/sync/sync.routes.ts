import { timingSafeEqual } from 'node:crypto';

import type { Request, RequestHandler } from 'express';
import { Router } from 'express';

import { env } from '../../config/env.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { HttpError } from '../../lib/httpError.js';
import { logger } from '../../lib/logger.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { syncMatchesQuerySchema } from './sync.schema.js';
import { syncService } from './sync.service.js';

export const syncRouter = Router();

const BEARER_PREFIX = 'Bearer ';
const SYNC_SECRET_HEADER = 'x-sync-secret';

interface FixedWindowState {
  count: number;
  resetAt: number;
}

const syncRouteWindowState: FixedWindowState = {
  count: 0,
  resetAt: 0,
};

const getPresentedSyncSecret = (request: Request): string | null => {
  const headerSecret = request.get(SYNC_SECRET_HEADER)?.trim();

  if (headerSecret) {
    return headerSecret;
  }

  const authorization = request.get('authorization')?.trim();

  if (authorization?.startsWith(BEARER_PREFIX)) {
    const bearerSecret = authorization.slice(BEARER_PREFIX.length).trim();
    return bearerSecret || null;
  }

  return null;
};

const secretsMatch = (expectedSecret: string, presentedSecret: string): boolean => {
  const expectedBuffer = Buffer.from(expectedSecret);
  const presentedBuffer = Buffer.from(presentedSecret);

  if (expectedBuffer.length !== presentedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, presentedBuffer);
};

const requireMatchSyncAccess: RequestHandler = (request, _response, next) => {
  const configuredSecret = env.MATCH_SYNC_TRIGGER_SECRET?.trim();

  if (!configuredSecret) {
    logger.error('Match sync route attempted without MATCH_SYNC_TRIGGER_SECRET configured', {
      ip: request.ip,
      path: request.originalUrl,
    });
    next(new HttpError(503, 'Match sync route is unavailable'));
    return;
  }

  const presentedSecret = getPresentedSyncSecret(request);

  if (!presentedSecret || !secretsMatch(configuredSecret, presentedSecret)) {
    logger.warn('Rejected unauthorized match sync request', {
      ip: request.ip,
      path: request.originalUrl,
    });
    next(new HttpError(403, 'Forbidden'));
    return;
  }

  next();
};

const limitMatchSyncRequests: RequestHandler = (_request, response, next) => {
  const now = Date.now();

  if (now >= syncRouteWindowState.resetAt) {
    syncRouteWindowState.count = 0;
    syncRouteWindowState.resetAt = now + env.MATCH_SYNC_ROUTE_RATE_LIMIT_WINDOW_MS;
  }

  syncRouteWindowState.count += 1;

  if (syncRouteWindowState.count > env.MATCH_SYNC_ROUTE_RATE_LIMIT_MAX) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((syncRouteWindowState.resetAt - now) / 1000),
    );

    response.setHeader('Retry-After', retryAfterSeconds.toString());
    next(new HttpError(429, 'Too many match sync requests. Please retry later.'));
    return;
  }

  next();
};

syncRouter.post(
  '/matches',
  requireMatchSyncAccess,
  limitMatchSyncRequests,
  asyncHandler(async (request, response) => {
    const query = syncMatchesQuerySchema.parse(request.query);

    try {
      const result = await syncService.syncMatchesBySeason(query.season);

      return sendSuccess(response, {
        statusCode: 202,
        message: `Match sync completed for season ${query.season}`,
        data: result,
      });
    } catch (error) {
      throw new HttpError(
        error instanceof HttpError ? 502 : 500,
        'Match sync failed. Review backend logs and retry when safe.',
      );
    }
  }),
);
