import type { NextFunction, Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import { ZodError } from 'zod';

import { HttpError } from '../lib/httpError.js';
import { logger } from '../lib/logger.js';

export const errorHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): Response => {
  if (error instanceof ZodError) {
    return response.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.errors.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (error instanceof HttpError) {
    return response.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  if (error instanceof PrismaClientKnownRequestError) {
    return response.status(400).json({
      success: false,
      message: 'Database request failed',
      code: error.code,
      meta: error.meta,
    });
  }

  logger.error('Unhandled application error', error);

  return response.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
