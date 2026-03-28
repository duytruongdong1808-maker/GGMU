import { useEffect, useState } from 'react';

import { getMatchDetail } from '../services/matchService';
import type { MatchDetail } from '../types/match';

export const useMatchDetail = (matchId: number | null) => {
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (!matchId) {
      setMatch(null);
      setError('Invalid match id.');
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const fetchMatch = async () => {
      setLoading(true);
      setError(null);

      try {
        const nextMatch = await getMatchDetail(matchId);

        if (!cancelled) {
          setMatch(nextMatch);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setMatch(null);
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load match details right now.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchMatch();

    return () => {
      cancelled = true;
    };
  }, [matchId, reloadToken]);

  return {
    match,
    loading,
    error,
    retry: () => setReloadToken((current) => current + 1),
  };
};
