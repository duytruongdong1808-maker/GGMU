import { players as curatedPlayers } from '../data/players';
import type { Player } from '../types/player';
import { requestJson } from './apiClient';

interface SquadApiPlayer {
  id: number;
  name: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  position: string | null;
  shirtNumber: number | null;
}

const curatedPlayersByName = new Map(
  curatedPlayers.map((player) => [player.name.trim().toLowerCase(), player]),
);

const getPositionGroup = (position: string): Player['positionGroup'] => {
  const normalizedPosition = position.toLowerCase();

  if (normalizedPosition.includes('keeper')) {
    return 'Goalkeepers';
  }

  if (
    normalizedPosition.includes('back') ||
    normalizedPosition.includes('def') ||
    normalizedPosition.includes('centre-back') ||
    normalizedPosition.includes('center-back')
  ) {
    return 'Defenders';
  }

  if (normalizedPosition.includes('mid')) {
    return 'Midfielders';
  }

  return 'Forwards';
};

const getPositionCode = (position: string): string => {
  const normalizedPosition = position.toLowerCase();

  if (normalizedPosition.includes('goalkeeper')) {
    return 'GK';
  }

  if (normalizedPosition.includes('centre-back') || normalizedPosition.includes('center-back')) {
    return 'CB';
  }

  if (normalizedPosition.includes('right-back')) {
    return 'RB';
  }

  if (normalizedPosition.includes('left-back')) {
    return 'LB';
  }

  if (normalizedPosition.includes('wing-back')) {
    return normalizedPosition.includes('left') ? 'LWB' : normalizedPosition.includes('right') ? 'RWB' : 'WB';
  }

  if (normalizedPosition.includes('defensive midfield')) {
    return 'CDM';
  }

  if (normalizedPosition.includes('attacking midfield')) {
    return 'CAM';
  }

  if (normalizedPosition.includes('midfield')) {
    return 'CM';
  }

  if (normalizedPosition.includes('wing')) {
    return normalizedPosition.includes('left') ? 'LW' : normalizedPosition.includes('right') ? 'RW' : 'WG';
  }

  if (normalizedPosition.includes('forward')) {
    return 'FW';
  }

  return 'ST';
};

const getAgeFromDateOfBirth = (dateOfBirth: string | null): number | null => {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthOffset = today.getUTCMonth() - birthDate.getUTCMonth();

  if (
    monthOffset < 0 ||
    (monthOffset === 0 && today.getUTCDate() < birthDate.getUTCDate())
  ) {
    age -= 1;
  }

  return age;
};

const buildFallbackBio = (player: SquadApiPlayer, positionLabel: string): string => {
  const nationality = player.nationality ?? 'the current squad';
  return `${player.name} is part of Manchester United's current first-team picture as a ${positionLabel.toLowerCase()} from ${nationality}.`;
};

const mapSquadPlayerToUiPlayer = (player: SquadApiPlayer): Player => {
  const curatedMatch = curatedPlayersByName.get(player.name.trim().toLowerCase());
  const position = player.position ?? curatedMatch?.position ?? 'Squad player';
  const age = getAgeFromDateOfBirth(player.dateOfBirth) ?? curatedMatch?.age ?? 0;
  const birthYear = player.dateOfBirth
    ? Number(player.dateOfBirth.slice(0, 4))
    : curatedMatch?.birthYear ?? 0;

  return {
    id: player.id,
    name: player.name,
    age,
    birthYear,
    nationality: player.nationality ?? curatedMatch?.nationality ?? 'Unknown',
    previousClub: curatedMatch?.previousClub ?? 'Manchester United pathway',
    position,
    positionGroup: curatedMatch?.positionGroup ?? getPositionGroup(position),
    positionCode: curatedMatch?.positionCode ?? getPositionCode(position),
    image: curatedMatch?.image ?? '',
    bio: curatedMatch?.bio ?? buildFallbackBio(player, position),
    formationLane: curatedMatch?.formationLane,
    formationOrder: curatedMatch?.formationOrder,
    formationRole: curatedMatch?.formationRole,
  };
};

export const getPlayers = async (): Promise<Player[]> => {
  const response = await requestJson<SquadApiPlayer[]>('/squad');

  return response.data.map(mapSquadPlayerToUiPlayer);
};
