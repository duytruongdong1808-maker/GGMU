import { useEffect, useState } from 'react';

import { getPlayers } from '../services/playerService';
import type { Player } from '../types/player';

export const usePlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchPlayers = async () => {
      setLoading(true);
      setError(null);

      try {
        const squad = await getPlayers();

        // Prevent async updates from landing after the component unmounts.
        if (!cancelled) {
          setPlayers(squad);
        }
      } catch {
        if (!cancelled) {
          setPlayers([]);
          setError('Unable to load the Manchester United first-team squad right now.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchPlayers();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return {
    players,
    loading,
    error,
    retry: () => setReloadToken((current) => current + 1),
  };
};
