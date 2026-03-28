import { useEffect, useState } from 'react';

import { getUpcomingMatches } from '../services/matchService';
import type { MatchSummary } from '../types/match';

export const useUpcomingMatches = (limit = 3) => {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchMatches = async () => {
      setLoading(true);
      setError(null);

      try {
        const nextMatches = await getUpcomingMatches(limit);

        if (!cancelled) {
          setMatches(nextMatches);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setMatches([]);
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load upcoming matches right now.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchMatches();

    return () => {
      cancelled = true;
    };
  }, [limit, reloadToken]);

  return {
    matches,
    loading,
    error,
    retry: () => setReloadToken((current) => current + 1),
  };
};
