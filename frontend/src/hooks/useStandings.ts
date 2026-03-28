import { useEffect, useState } from 'react';

import { getStandings } from '../services/standingsService';
import type { StandingsSnapshot } from '../types/standings';

export const useStandings = () => {
  const [standings, setStandings] = useState<StandingsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchStandings = async () => {
      setLoading(true);
      setError(null);

      try {
        const nextStandings = await getStandings();

        if (!cancelled) {
          setStandings(nextStandings);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setStandings(null);
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load standings right now.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchStandings();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return {
    standings,
    loading,
    error,
    retry: () => setReloadToken((current) => current + 1),
  };
};
