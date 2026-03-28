import axios, { AxiosError, type AxiosInstance } from 'axios';

import { env, type FootballApiProvider } from '../../config/env.js';
import { HttpError } from '../../lib/httpError.js';
import { logger } from '../../lib/logger.js';
import type {
  ApiFootballFixtureResponse,
  ApiFootballLineupResponse,
  ApiFootballPlayerStatisticsResponse,
  ApiFootballStatisticResponse,
} from './footballApi.mapper.js';

interface ApiFootballEnvelope<T> {
  response: T[];
}

interface ApiFootballErrorResponse {
  errors?: Record<string, unknown>;
  response?: unknown[];
}

interface FootballApiProviderConfig {
  provider: FootballApiProvider;
  baseURL: string;
  host: string;
  authHeaderName: 'x-apisports-key' | 'x-rapidapi-key';
  hostHeaderName?: 'x-rapidapi-host';
  providerExplicit: boolean;
}

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const maskApiKey = (apiKey: string): string => {
  const trimmedApiKey = apiKey.trim();

  if (trimmedApiKey.length <= 8) {
    return `${trimmedApiKey.slice(0, 2)}***${trimmedApiKey.slice(-1)}`;
  }

  return `${trimmedApiKey.slice(0, 4)}...${trimmedApiKey.slice(-4)}`;
};

type ProviderFailureKind = 'authentication' | 'access';

const getProviderFailureKind = (
  statusCode: number,
  responseBody?: ApiFootballErrorResponse,
): ProviderFailureKind | null => {
  if (statusCode === 401) {
    return 'authentication';
  }

  if (statusCode !== 403) {
    return null;
  }

  const errorMessages = Object.values(responseBody?.errors ?? {})
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.toLowerCase());

  if (errorMessages.some((value) => value.includes('method not supported'))) {
    return 'access';
  }

  if (
    errorMessages.some(
      (value) => value.includes('token') || value.includes('credential'),
    )
  ) {
    return 'authentication';
  }

  return null;
};

export class FootballApiClient {
  private readonly httpClient: AxiosInstance;

  private readonly providerConfig: FootballApiProviderConfig;

  private lastRequestAt = 0;

  constructor() {
    this.providerConfig = this.resolveProviderConfig();
    this.httpClient = axios.create({
      baseURL: this.providerConfig.baseURL,
      timeout: env.FOOTBALL_API_TIMEOUT_MS,
      headers: this.buildDefaultHeaders(),
    });
  }

  private async throttle(): Promise<void> {
    const elapsed = Date.now() - this.lastRequestAt;

    if (elapsed < env.FOOTBALL_API_RATE_LIMIT_MS) {
      await sleep(env.FOOTBALL_API_RATE_LIMIT_MS - elapsed);
    }

    this.lastRequestAt = Date.now();
  }

  private resolveProviderConfig(): FootballApiProviderConfig {
    if (env.FOOTBALL_API_PROVIDER === 'rapidapi') {
      return {
        provider: 'rapidapi',
        baseURL: env.FOOTBALL_API_BASE_URL,
        host: env.FOOTBALL_API_HOST,
        authHeaderName: 'x-rapidapi-key',
        hostHeaderName: 'x-rapidapi-host',
        providerExplicit: typeof process.env.FOOTBALL_API_PROVIDER === 'string',
      };
    }

    return {
      provider: 'apisports',
      baseURL: env.FOOTBALL_API_BASE_URL,
      host: env.FOOTBALL_API_HOST,
      authHeaderName: 'x-apisports-key',
      providerExplicit: typeof process.env.FOOTBALL_API_PROVIDER === 'string',
    };
  }

  private buildDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      [this.providerConfig.authHeaderName]: env.FOOTBALL_API_KEY,
    };

    if (this.providerConfig.hostHeaderName) {
      headers[this.providerConfig.hostHeaderName] = this.providerConfig.host;
    }

    return headers;
  }

  private getSafeConfigSummary(): Record<string, string | boolean> {
    return {
      provider: this.providerConfig.provider,
      providerExplicit: this.providerConfig.providerExplicit,
      baseURL: this.providerConfig.baseURL,
      host: this.providerConfig.host,
      apiKeyExists: env.FOOTBALL_API_KEY.trim().length > 0,
      authHeaderName: this.providerConfig.authHeaderName,
      hostHeaderName: this.providerConfig.hostHeaderName ?? 'none',
      apiKeyPreview: maskApiKey(env.FOOTBALL_API_KEY),
    };
  }

  private async get<T>(
    endpoint: string,
    params: Record<string, string | number | undefined>,
    attempt = 0,
  ): Promise<T[]> {
    await this.throttle();

    try {
      const response = await this.httpClient.get<ApiFootballEnvelope<T>>(endpoint, { params });
      return response.data.response;
    } catch (error) {
      const axiosError = error as AxiosError<ApiFootballErrorResponse>;
      const statusCode = axiosError.response?.status ?? 500;
      const retryable = statusCode === 429 || statusCode >= 500;
      const responseBody = axiosError.response?.data;
      const providerFailureKind = getProviderFailureKind(statusCode, responseBody);

      if (retryable && attempt < env.FOOTBALL_API_RETRY_COUNT) {
        const backoffMs = env.FOOTBALL_API_RATE_LIMIT_MS * (attempt + 1);
        logger.warn('Retrying football API request after failure', {
          endpoint,
          attempt: attempt + 1,
          statusCode,
          backoffMs,
        });
        await sleep(backoffMs);
        return this.get<T>(endpoint, params, attempt + 1);
      }

      if (providerFailureKind) {
        const message =
          providerFailureKind === 'authentication'
            ? `Football data provider authentication failed for ${this.providerConfig.provider}. Check FOOTBALL_API_PROVIDER, FOOTBALL_API_BASE_URL, FOOTBALL_API_HOST, and FOOTBALL_API_KEY.`
            : `Football data provider rejected ${endpoint} for ${this.providerConfig.provider}. Check your subscribed product, plan entitlement, and whether this endpoint is allowed for the current key.`;
        const hint =
          providerFailureKind === 'authentication'
            ? 'Verify the provider mode, base URL, host header usage, and API key.'
            : 'A 403 response with "Method not supported" usually means the key is valid but the route or product is not enabled for the current subscription.';

        logger.error('Football API provider access/configuration failed', {
          endpoint,
          params,
          statusCode,
          failureKind: providerFailureKind,
          config: this.getSafeConfigSummary(),
          responseErrors: responseBody?.errors,
        });

        throw new HttpError(
          502,
          message,
          {
            endpoint,
            params,
            statusCode,
            provider: this.providerConfig.provider,
            failureKind: providerFailureKind,
            hint,
            config: this.getSafeConfigSummary(),
            responseErrors: responseBody?.errors,
          },
        );
      }

      logger.error('Football API request failed', {
        endpoint,
        params,
        statusCode,
        config: this.getSafeConfigSummary(),
        body: responseBody,
      });

      throw new HttpError(502, 'Football data provider request failed', {
        endpoint,
        statusCode,
        provider: this.providerConfig.provider,
      });
    }
  }

  async fetchPastFixturesBySeason(season: number): Promise<ApiFootballFixtureResponse[]> {
    const fixtures = await this.get<ApiFootballFixtureResponse>('/fixtures', {
      team: env.MANCHESTER_UNITED_TEAM_ID,
      season,
      status: 'FT-AET-PEN',
    });

    return fixtures.filter((fixture) => new Date(fixture.fixture.date) < new Date());
  }

  async fetchUpcomingFixtures(limit = 3): Promise<ApiFootballFixtureResponse[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 10);
    const now = Date.now();
    const fixtures = await this.get<ApiFootballFixtureResponse>('/fixtures', {
      team: env.MANCHESTER_UNITED_TEAM_ID,
      next: safeLimit,
    });

    return fixtures
      .filter((fixture) => new Date(fixture.fixture.date).getTime() >= now)
      .sort((left, right) => new Date(left.fixture.date).getTime() - new Date(right.fixture.date).getTime())
      .slice(0, safeLimit);
  }

  async fetchMatchDetails(fixtureId: number): Promise<ApiFootballFixtureResponse> {
    const fixtures = await this.get<ApiFootballFixtureResponse>('/fixtures', {
      id: fixtureId,
    });

    const fixture = fixtures[0];

    if (!fixture) {
      throw new HttpError(404, `Match details not found for external fixture ${fixtureId}`);
    }

    return fixture;
  }

  async fetchMatchStatistics(fixtureId: number): Promise<ApiFootballStatisticResponse[]> {
    return this.get<ApiFootballStatisticResponse>('/fixtures/statistics', {
      fixture: fixtureId,
    });
  }

  async fetchMatchLineups(fixtureId: number): Promise<ApiFootballLineupResponse[]> {
    return this.get<ApiFootballLineupResponse>('/fixtures/lineups', {
      fixture: fixtureId,
    });
  }

  async fetchMatchPlayers(fixtureId: number): Promise<ApiFootballPlayerStatisticsResponse[]> {
    return this.get<ApiFootballPlayerStatisticsResponse>('/fixtures/players', {
      fixture: fixtureId,
    });
  }
}

export const footballApiClient = new FootballApiClient();
