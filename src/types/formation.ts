export interface FormationSlot {
  role: string;
  playerName: string;
  positionCode: string;
  lane:
    | 'goalkeeper'
    | 'defense'
    | 'double-pivot'
    | 'attacking-midfield'
    | 'striker';
}
