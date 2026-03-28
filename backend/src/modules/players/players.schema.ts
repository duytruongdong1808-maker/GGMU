import { z } from 'zod';

const optionalNumber = z.preprocess(
  (value) => (value === undefined || value === '' ? undefined : Number(value)),
  z.number().int().positive().optional(),
);

const optionalString = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().min(1).optional(),
);

export const playerSearchQuerySchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  page: optionalNumber.default(1),
  limit: optionalNumber.default(10),
});

export const playerMatchesParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const playerMatchesQuerySchema = z.object({
  page: optionalNumber.default(1),
  limit: optionalNumber.default(10),
  season: optionalNumber,
  competition: optionalString,
});

export const appearanceSummaryQuerySchema = z.object({
  season: z.coerce.number().int().positive(),
  page: optionalNumber.default(1),
  limit: optionalNumber.default(20),
});

export type PlayerSearchQuery = z.infer<typeof playerSearchQuerySchema>;
export type PlayerMatchesParams = z.infer<typeof playerMatchesParamsSchema>;
export type PlayerMatchesQuery = z.infer<typeof playerMatchesQuerySchema>;
export type AppearanceSummaryQuery = z.infer<typeof appearanceSummaryQuerySchema>;
