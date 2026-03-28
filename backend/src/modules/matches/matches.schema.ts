import { z } from 'zod';

import { isValidDateString } from '../../utils/date.js';

const optionalNumber = z.preprocess(
  (value) => (value === undefined || value === '' ? undefined : Number(value)),
  z.number().int().positive().optional(),
);

const optionalString = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().min(1).optional(),
);

const optionalDateString = z
  .preprocess((value) => (value === undefined || value === '' ? undefined : value), z.string().optional())
  .refine((value) => value === undefined || isValidDateString(value), {
    message: 'Invalid date format. Use ISO date strings such as 2025-03-15.',
  });

const baseMatchFilterSchema = z.object({
  page: optionalNumber.default(1),
  limit: optionalNumber.default(10),
  season: optionalNumber,
  competition: optionalString,
  result: z.enum(['win', 'draw', 'loss']).optional(),
  homeAway: z.enum(['home', 'away']).optional(),
  fromDate: optionalDateString,
  toDate: optionalDateString,
  sort: z.enum(['newest', 'oldest', 'competition']).default('newest'),
});

export const matchListQuerySchema = baseMatchFilterSchema;

export const matchSearchQuerySchema = baseMatchFilterSchema.extend({
  keyword: optionalString,
  opponent: optionalString,
  player: optionalString,
});

export const matchIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const recentMatchesQuerySchema = z.object({
  limit: optionalNumber.default(5),
});

export const upcomingMatchesQuerySchema = z.object({
  limit: optionalNumber.default(3),
});

export const headToHeadQuerySchema = z.object({
  opponent: z.string().trim().min(1, 'opponent is required'),
  page: optionalNumber.default(1),
  limit: optionalNumber.default(10),
});

export type MatchListQuery = z.infer<typeof matchListQuerySchema>;
export type MatchSearchQuery = z.infer<typeof matchSearchQuerySchema>;
export type MatchIdParams = z.infer<typeof matchIdParamsSchema>;
export type RecentMatchesQuery = z.infer<typeof recentMatchesQuerySchema>;
export type UpcomingMatchesQuery = z.infer<typeof upcomingMatchesQuerySchema>;
export type HeadToHeadQuery = z.infer<typeof headToHeadQuerySchema>;
