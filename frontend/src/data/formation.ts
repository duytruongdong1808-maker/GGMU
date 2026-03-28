import type { FormationLane, FormationSlot } from '../types/formation';
import type { Player } from '../types/player';

export const laneOrder: FormationLane[] = [
  'striker',
  'attacking-midfield',
  'double-pivot',
  'defense',
  'goalkeeper',
];

export const getFormationSlots = (squad: Player[]): FormationSlot[] => {
  return squad
    .filter(
      (player): player is Player & Required<Pick<Player, 'formationLane' | 'formationOrder' | 'formationRole'>> =>
        Boolean(player.formationLane && player.formationOrder && player.formationRole),
    )
    .map((player) => ({
      playerId: player.id,
      role: player.formationRole,
      playerName: player.name,
      positionCode: player.positionCode,
      lane: player.formationLane,
      order: player.formationOrder,
    }))
    .sort((left, right) => {
      const laneOffset =
        laneOrder.indexOf(left.lane) - laneOrder.indexOf(right.lane);

      if (laneOffset !== 0) {
        return laneOffset;
      }

      return left.order - right.order;
    });
};
