import { players } from '../data/players';
import type { Player } from '../types/player';

const SIMULATED_DELAY_MS = 900;

export const getPlayers = async (): Promise<Player[]> => {
  await new Promise((resolve) => {
    window.setTimeout(resolve, SIMULATED_DELAY_MS);
  });

  return players;
};
