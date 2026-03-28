import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import { z } from 'zod';

import { logger } from '../lib/logger.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(currentDir, '../../.env');

dotenv.config({ path: envPath });

const footballApiProviderSchema = z.enum(['apisports', 'rapidapi']);

export type FootballApiProvider = z.infer<typeof footballApiProviderSchema>;

const footballApiKeyPlaceholders = new Set([
  'replace_with_real_api_key',
  'your_api_football_key',
]);

const maskApiKey = (apiKey?: string): string => {
  const trimmedApiKey = apiKey?.trim() ?? '';

  if (!trimmedApiKey) {
    return 'missing';
  }

  if (trimmedApiKey.length <= 8) {
    return `${trimmedApiKey.slice(0, 2)}***${trimmedApiKey.slice(-1)}`;
  }

  return `${trimmedApiKey.slice(0, 4)}...${trimmedApiKey.slice(-4)}`;
};

const inferFootballApiProvider = (
  baseURL?: string,
  host?: string,
): FootballApiProvider => {
  const normalizedBaseURL = baseURL?.toLowerCase() ?? '';
  const normalizedHost = host?.toLowerCase() ?? '';

  if (normalizedBaseURL.includes('rapidapi.com') || normalizedHost.includes('rapidapi.com')) {
    return 'rapidapi';
  }

  // Default to API-SPORTS direct mode unless RapidAPI is explicitly configured.
  return 'apisports';
};

const resolveFootballApiDefaults = (provider: FootballApiProvider) =>
  provider === 'rapidapi'
    ? {
        baseURL: 'https://api-football-v1.p.rapidapi.com/v3',
        host: 'api-football-v1.p.rapidapi.com',
      }
    : {
        baseURL: 'https://v3.football.api-sports.io',
        host: 'v3.football.api-sports.io',
      };

const logFootballApiConfigDiagnostic = (): void => {
  const providerFromEnv = footballApiProviderSchema.safeParse(process.env.FOOTBALL_API_PROVIDER);
  const provider = providerFromEnv.success
    ? providerFromEnv.data
    : inferFootballApiProvider(process.env.FOOTBALL_API_BASE_URL, process.env.FOOTBALL_API_HOST);
  const defaults = resolveFootballApiDefaults(provider);
  const apiKey = process.env.FOOTBALL_API_KEY;

  logger.info('Football API config diagnostic', {
    provider,
    baseURL: process.env.FOOTBALL_API_BASE_URL ?? defaults.baseURL,
    host: process.env.FOOTBALL_API_HOST ?? defaults.host,
    apiKeyExists: Boolean(apiKey?.trim()),
    apiKeyPreview: maskApiKey(apiKey),
  });
};

logFootballApiConfigDiagnostic();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  FRONTEND_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  FOOTBALL_DATA_BASE_URL: z.string().url().default('https://api.football-data.org/v4'),
  FOOTBALL_DATA_API_KEY: z.string().trim().min(1).optional(),
  FOOTBALL_DATA_TEAM_ID: z.coerce.number().int().positive().default(66),
  TEAM_CACHE_TTL_MINUTES: z.coerce.number().int().positive().default(360),
  FOOTBALL_DATA_STANDINGS_COMPETITION: z.string().trim().min(1).default('PL'),
  FOOTBALL_API_PROVIDER: footballApiProviderSchema.optional(),
  FOOTBALL_API_BASE_URL: z.string().url().optional(),
  FOOTBALL_API_KEY: z.string().min(1, 'FOOTBALL_API_KEY is required'),
  FOOTBALL_API_HOST: z.string().min(1).optional(),
  FOOTBALL_API_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  FOOTBALL_API_RATE_LIMIT_MS: z.coerce.number().int().positive().default(350),
  FOOTBALL_API_RETRY_COUNT: z.coerce.number().int().min(0).max(5).default(3),
  MANCHESTER_UNITED_TEAM_ID: z.coerce.number().int().positive().default(33),
  MATCH_SYNC_CRON: z.string().min(1).default('0 3,15 * * *'),
  MATCH_SYNC_ENABLED: z
    .string()
    .default('true')
    .transform((value) => value.toLowerCase() === 'true'),
  MATCH_SYNC_TRIGGER_SECRET: z.string().trim().min(1).optional(),
  MATCH_SYNC_ROUTE_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  MATCH_SYNC_ROUTE_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(3),
})
  .superRefine((value, context) => {
    if (footballApiKeyPlaceholders.has(value.FOOTBALL_API_KEY)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['FOOTBALL_API_KEY'],
        message: 'FOOTBALL_API_KEY must be set to a real provider key, not the example placeholder',
      });
    }
  })
  .transform((value) => {
    const footballApiProvider = value.FOOTBALL_API_PROVIDER
      ?? inferFootballApiProvider(value.FOOTBALL_API_BASE_URL, value.FOOTBALL_API_HOST);
    const footballApiDefaults = resolveFootballApiDefaults(footballApiProvider);

    return {
      ...value,
      FOOTBALL_API_PROVIDER: footballApiProvider,
      FOOTBALL_API_BASE_URL: value.FOOTBALL_API_BASE_URL ?? footballApiDefaults.baseURL,
      FOOTBALL_API_HOST: value.FOOTBALL_API_HOST ?? footballApiDefaults.host,
    };
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment configuration: ${parsedEnv.error.errors
      .map((error) => `${error.path.join('.')}: ${error.message}`)
      .join(', ')}`,
  );
}

export const env = parsedEnv.data;



