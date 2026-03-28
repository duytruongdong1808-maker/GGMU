import { z } from 'zod';

export const syncMatchesQuerySchema = z.object({
  season: z.coerce.number().int().positive({
    message: 'season is required and must be a positive number',
  }),
});

export type SyncMatchesQuery = z.infer<typeof syncMatchesQuerySchema>;
