export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MatchSummary {
  id: number | null;
  detailAvailable: boolean;
  externalApiId: number;
  date: string;
  competition: {
    id: number;
    name: string;
    country: string | null;
    logo: string | null;
  };
  season: number;
  venue: string | null;
  status: string;
  homeAway: 'home' | 'away';
  opponent: {
    id: number;
    name: string;
    logo: string | null;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string | null;
    };
    away: {
      id: number;
      name: string;
      logo: string | null;
    };
  };
  score: {
    home: number | null;
    away: number | null;
    manchesterUnited: number | null;
    opponent: number | null;
  };
  result: 'win' | 'draw' | 'loss' | null;
}

export interface MatchStatisticSide {
  possession: number | null;
  shots: number | null;
  shotsOnTarget: number | null;
  corners: number | null;
  fouls: number | null;
  yellowCards: number | null;
  redCards: number | null;
  offsides: number | null;
  passes: number | null;
}

export interface MatchLineupPlayer {
  id: number;
  name: string;
  position: string | null;
  photo: string | null;
}

export interface MatchPlayerParticipation {
  id: number;
  name: string;
  position: string | null;
}

export interface MatchPlayerStat extends MatchPlayerParticipation {
  minutes: number | null;
  goals: number | null;
  assists: number | null;
  shots: number | null;
  keyPasses: number | null;
  rating: number | null;
  yellowCards: number | null;
  redCards: number | null;
  isStarter: boolean;
  isSubstitute: boolean;
}

export interface MatchDetail {
  id: number;
  externalApiId: number;
  season: number;
  basicInfo: {
    date: string;
    competition: string;
    venue: string | null;
    homeTeam: string;
    awayTeam: string;
    score: {
      home: number | null;
      away: number | null;
    };
    status: string;
    result: 'win' | 'draw' | 'loss' | null;
    homeAway: 'home' | 'away';
    opponent: string;
  };
  statistics: {
    home: MatchStatisticSide | null;
    away: MatchStatisticSide | null;
    manchesterUnited: MatchStatisticSide | null;
    opponent: MatchStatisticSide | null;
  };
  lineup: {
    manchesterUnited: {
      formation: string | null;
      coach: string | null;
      startingXI: MatchLineupPlayer[];
      substitutes: MatchLineupPlayer[];
    };
    opponent: {
      formation: string | null;
      coach: string | null;
      startingXI: MatchLineupPlayer[];
      substitutes: MatchLineupPlayer[];
    };
  };
  playersWhoPlayed: MatchPlayerParticipation[];
  playerMatchStats: MatchPlayerStat[];
}
