import type { Response } from 'express';

import type { PaginationMeta } from './pagination.js';

interface SuccessPayload<T> {
  statusCode?: number;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export const sendSuccess = <T>(response: Response, payload: SuccessPayload<T>): Response => {
  const { statusCode = 200, message, data, pagination } = payload;

  return response.status(statusCode).json({
    success: true,
    message,
    data,
    ...(pagination ? { pagination } : {}),
  });
};
