import type { Request, Response } from 'express';

export const notFound = (request: Request, response: Response): Response => {
  return response.status(404).json({
    success: false,
    message: `Route ${request.method} ${request.originalUrl} not found`,
  });
};
