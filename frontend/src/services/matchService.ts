import type { MatchDetail, MatchSummary } from '../types/match';
import { requestJson } from './apiClient';

export const getRecentMatches = async (limit = 5): Promise<MatchSummary[]> => {
  const response = await requestJson<MatchSummary[]>(`/matches/recent?limit=${limit}`);
  return response.data;
};

export const getUpcomingMatches = async (limit = 3): Promise<MatchSummary[]> => {
  const response = await requestJson<MatchSummary[]>(`/matches/upcoming?limit=${limit}`);
  return response.data;
};

export const getMatchDetail = async (matchId: number): Promise<MatchDetail> => {
  const response = await requestJson<MatchDetail>(`/matches/${matchId}`);
  return response.data;
};
