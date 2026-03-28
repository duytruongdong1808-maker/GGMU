import type { FormationLane } from './formation';

export type PositionGroup =
  | 'Goalkeepers'
  | 'Defenders'
  | 'Midfielders'
  | 'Forwards';

export interface Player {
  id: number;
  name: string;
  age: number;
  birthYear: number;
  nationality: string;
  previousClub: string;
  position: string;
  positionGroup: PositionGroup;
  positionCode: string;
  image: string;
  bio: string;
  formationLane?: FormationLane;
  formationOrder?: number;
  formationRole?: string;
}
