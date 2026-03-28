export type FormationLane =
  | 'goalkeeper'
  | 'defense'
  | 'double-pivot'
  | 'attacking-midfield'
  | 'striker';

export interface FormationSlot {
  playerId: number;
  role: string;
  playerName: string;
  positionCode: string;
  lane: FormationLane;
  order: number;
}
