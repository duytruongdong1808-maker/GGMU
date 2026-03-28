import axios, { AxiosError, type AxiosInstance } from 'axios';

import { env } from '../../config/env.js';
import { HttpError } from '../../lib/httpError.js';
import { logger } from '../../lib/logger.js';

export interface FootballDataCompetitionResponse {
  id: number;
  name: string;
  code: string | null;
  type: string | null;
  emblem: string | null;
}

export interface FootballDataSquadMemberResponse {
  id: number;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  position?: string | null;
  shirtNumber?: number | null;
  role?: string | null;
}

export interface FootballDataTeamResponse {
  id: number;
  name: string;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
  address: string | null;
  website: string | null;
  founded: number | null;
  clubColors: string | null;
  venue: string | null;
  runningCompetitions?: FootballDataCompetitionResponse[];
  squad?: FootballDataSquadMemberResponse[];
  lastUpdated?: string | null;
}

export interface FootballDataStandingsTeamResponse {
  id: number;
  name: string;
  shortName?: string | null;
  tla?: string | null;
  crest?: string | null;
}

export interface FootballDataStandingsTableEntryResponse {
  position: number;
  team: FootballDataStandingsTeamResponse;
  playedGames: number;
  form?: string | null;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface FootballDataStandingsResponse {
  competition: FootballDataCompetitionResponse;
  season: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday?: number | null;
  };
  standings: Array<{
    stage?: string | null;
    type?: string | null;
    group?: string | null;
    table: FootballDataStandingsTableEntryResponse[];
  }>;
}

interface FootballDataErrorResponse {
  message?: string;
  errorCode?: number;
}

export class FootballDataClient {
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL: env.FOOTBALL_DATA_BASE_URL,
      timeout: env.FOOTBALL_API_TIMEOUT_MS,
    });
  }

  private ensureConfigured() {
    if (env.FOOTBALL_DATA_API_KEY?.trim()) {
      return;
    }

    throw new HttpError(
      503,
      'football-data.org is not configured. Set FOOTBALL_DATA_API_KEY to enable team and squad endpoints.',
    );
  }

  async fetchTeam(teamId = env.FOOTBALL_DATA_TEAM_ID): Promise<FootballDataTeamResponse> {
    this.ensureConfigured();

    try {
      const response = await this.httpClient.get<FootballDataTeamResponse>(`/teams/${teamId}`, {
        headers: {
          'X-Auth-Token': env.FOOTBALL_DATA_API_KEY,
        },
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<FootballDataErrorResponse>;
      const statusCode = axiosError.response?.status ?? 500;

      logger.error('football-data.org team request failed', {
        teamId,
        statusCode,
        message: axiosError.response?.data?.message ?? axiosError.message,
      });

      throw new HttpError(502, 'football-data.org request failed', {
        teamId,
        statusCode,
      });
    }
  }

  async fetchStandings(
    competitionCode = env.FOOTBALL_DATA_STANDINGS_COMPETITION,
  ): Promise<FootballDataStandingsResponse> {
    this.ensureConfigured();

    try {
      const response = await this.httpClient.get<FootballDataStandingsResponse>(
        `/competitions/${competitionCode}/standings`,
        {
          headers: {
            'X-Auth-Token': env.FOOTBALL_DATA_API_KEY,
          },
        },
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<FootballDataErrorResponse>;
      const statusCode = axiosError.response?.status ?? 500;

      logger.error('football-data.org standings request failed', {
        competitionCode,
        statusCode,
        message: axiosError.response?.data?.message ?? axiosError.message,
      });

      throw new HttpError(502, 'football-data.org standings request failed', {
        competitionCode,
        statusCode,
      });
    }
  }
}

export const footballDataClient = new FootballDataClient();
