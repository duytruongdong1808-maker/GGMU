import type { StandingsSnapshot } from '../types/standings';
import { requestJson } from './apiClient';

export const getStandings = async (): Promise<StandingsSnapshot> => {
  const response = await requestJson<StandingsSnapshot>('/standings');
  return response.data;
};
