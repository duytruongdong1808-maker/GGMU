export interface StandingsRow {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string | null;
    tla: string | null;
    crest: string | null;
  };
  playedGames: number;
  points: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form: string | null;
  isManchesterUnited: boolean;
}

export interface HighlightedStandingsTeam {
  id: number;
  name: string;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
  position: number;
  playedGames: number;
  points: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form: string | null;
}

export interface StandingsSnapshot {
  competition: {
    id: number;
    name: string;
    code: string | null;
    type: string | null;
    emblem: string | null;
  };
  season: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number | null;
  };
  highlightedTeam: HighlightedStandingsTeam;
  table: StandingsRow[];
}
