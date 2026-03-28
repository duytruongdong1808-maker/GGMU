const MatchResultValues = {
  WIN: 'WIN',
  DRAW: 'DRAW',
  LOSS: 'LOSS',
} as const;

export type MatchResultValue = (typeof MatchResultValues)[keyof typeof MatchResultValues];

export interface ApiFootballTeamReference {
  id: number;
  name: string;
  logo?: string | null;
}

export interface ApiFootballFixtureResponse {
  fixture: {
    id: number;
    date: string;
    venue?: {
      name?: string | null;
    } | null;
    status: {
      long: string;
      short: string;
    };
  };
  league: {
    id: number;
    name: string;
    country?: string | null;
    logo?: string | null;
    season: number;
  };
  teams: {
    home: ApiFootballTeamReference;
    away: ApiFootballTeamReference;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

export interface ApiFootballStatisticResponse {
  team: ApiFootballTeamReference;
  statistics: Array<{
    type: string;
    value: number | string | null;
  }>;
}

export interface ApiFootballLineupResponse {
  team: ApiFootballTeamReference;
  formation?: string | null;
  coach?: {
    name?: string | null;
  } | null;
  startXI: Array<{
    player: {
      id: number;
      name: string;
      pos?: string | null;
    };
  }>;
  substitutes: Array<{
    player: {
      id: number;
      name: string;
      pos?: string | null;
    };
  }>;
}

export interface ApiFootballPlayerStatisticsResponse {
  team: ApiFootballTeamReference;
  players: Array<{
    player: {
      id: number;
      name: string;
      photo?: string | null;
    };
    statistics: Array<{
      games?: {
        minutes?: number | null;
        position?: string | null;
        rating?: string | null;
        substitute?: boolean | null;
      } | null;
      shots?: {
        total?: number | null;
      } | null;
      goals?: {
        total?: number | null;
        assists?: number | null;
      } | null;
      passes?: {
        key?: number | null;
      } | null;
      cards?: {
        yellow?: number | null;
        red?: number | null;
      } | null;
    }>;
  }>;
}

export interface NormalizedTeamInput {
  externalApiId: number;
  name: string;
  shortName: string | null;
  logo: string | null;
}

export interface NormalizedCompetitionInput {
  externalApiId: number;
  name: string;
  country: string | null;
  logo: string | null;
}

export interface NormalizedPlayerInput {
  externalApiId: number;
  name: string;
  nationality: string | null;
  position: string | null;
  photo: string | null;
}

export interface NormalizedMatchInput {
  externalApiId: number;
  seasonYear: number;
  competition: NormalizedCompetitionInput;
  homeTeam: NormalizedTeamInput;
  awayTeam: NormalizedTeamInput;
  opponentTeam: NormalizedTeamInput;
  venue: string | null;
  matchDate: Date;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  isManchesterUnitedHome: boolean;
  resultForManchesterUnited: MatchResultValue | null;
}

export interface NormalizedMatchStatisticInput {
  possessionHome: number | null;
  possessionAway: number | null;
  shotsHome: number | null;
  shotsAway: number | null;
  shotsOnTargetHome: number | null;
  shotsOnTargetAway: number | null;
  cornersHome: number | null;
  cornersAway: number | null;
  foulsHome: number | null;
  foulsAway: number | null;
  yellowCardsHome: number | null;
  yellowCardsAway: number | null;
  redCardsHome: number | null;
  redCardsAway: number | null;
  offsidesHome: number | null;
  offsidesAway: number | null;
  passesHome: number | null;
  passesAway: number | null;
}

export interface NormalizedLineupInput {
  team: NormalizedTeamInput;
  formation: string | null;
  coachName: string | null;
}

export interface NormalizedMatchPlayerInput {
  player: NormalizedPlayerInput;
  team: NormalizedTeamInput;
  isStarter: boolean;
  isSubstitute: boolean;
  minutesPlayed: number | null;
  goals: number | null;
  assists: number | null;
  shots: number | null;
  keyPasses: number | null;
  yellowCards: number | null;
  redCards: number | null;
  rating: number | null;
}

export interface NormalizedMatchBundle {
  match: NormalizedMatchInput;
  statistics: NormalizedMatchStatisticInput | null;
  lineups: NormalizedLineupInput[];
  players: NormalizedMatchPlayerInput[];
}

const parseNumericValue = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value;
  }

  const normalized = value.replace('%', '').trim();
  const parsedValue = Number(normalized);
  return Number.isNaN(parsedValue) ? null : parsedValue;
};

const toTeamInput = (team: ApiFootballTeamReference): NormalizedTeamInput => ({
  externalApiId: team.id,
  name: team.name,
  shortName: null,
  logo: team.logo ?? null,
});

const calculateResultForManchesterUnited = (
  isHome: boolean,
  homeScore: number | null,
  awayScore: number | null,
): MatchResultValue | null => {
  if (homeScore === null || awayScore === null) {
    return null;
  }

  const muScore = isHome ? homeScore : awayScore;
  const opponentScore = isHome ? awayScore : homeScore;

  if (muScore > opponentScore) {
    return MatchResultValues.WIN;
  }

  if (muScore < opponentScore) {
    return MatchResultValues.LOSS;
  }

  return MatchResultValues.DRAW;
};

export const mapFixtureToMatch = (
  fixture: ApiFootballFixtureResponse,
  manchesterUnitedTeamId: number,
): NormalizedMatchInput => {
  const homeTeam = toTeamInput(fixture.teams.home);
  const awayTeam = toTeamInput(fixture.teams.away);
  const isManchesterUnitedHome = homeTeam.externalApiId === manchesterUnitedTeamId;
  const opponentTeam = isManchesterUnitedHome ? awayTeam : homeTeam;

  return {
    externalApiId: fixture.fixture.id,
    seasonYear: fixture.league.season,
    competition: {
      externalApiId: fixture.league.id,
      name: fixture.league.name,
      country: fixture.league.country ?? null,
      logo: fixture.league.logo ?? null,
    },
    homeTeam,
    awayTeam,
    opponentTeam,
    venue: fixture.fixture.venue?.name ?? null,
    matchDate: new Date(fixture.fixture.date),
    status: fixture.fixture.status.long || fixture.fixture.status.short,
    homeScore: fixture.goals.home,
    awayScore: fixture.goals.away,
    isManchesterUnitedHome,
    resultForManchesterUnited: calculateResultForManchesterUnited(
      isManchesterUnitedHome,
      fixture.goals.home,
      fixture.goals.away,
    ),
  };
};

export const mapFixtureStatistics = (
  statistics: ApiFootballStatisticResponse[],
  homeTeamExternalApiId: number,
  awayTeamExternalApiId: number,
): NormalizedMatchStatisticInput | null => {
  if (statistics.length === 0) {
    return null;
  }

  const lookup = new Map<number, Record<string, number | null>>();

  for (const teamStatistics of statistics) {
    const statisticMap: Record<string, number | null> = {};

    for (const statistic of teamStatistics.statistics) {
      statisticMap[statistic.type] = parseNumericValue(statistic.value);
    }

    lookup.set(teamStatistics.team.id, statisticMap);
  }

  const home = lookup.get(homeTeamExternalApiId) ?? {};
  const away = lookup.get(awayTeamExternalApiId) ?? {};

  return {
    possessionHome: home['Ball Possession'] ?? null,
    possessionAway: away['Ball Possession'] ?? null,
    shotsHome: home['Total Shots'] ?? null,
    shotsAway: away['Total Shots'] ?? null,
    shotsOnTargetHome: home['Shots on Goal'] ?? null,
    shotsOnTargetAway: away['Shots on Goal'] ?? null,
    cornersHome: home['Corner Kicks'] ?? null,
    cornersAway: away['Corner Kicks'] ?? null,
    foulsHome: home['Fouls'] ?? null,
    foulsAway: away['Fouls'] ?? null,
    yellowCardsHome: home['Yellow Cards'] ?? null,
    yellowCardsAway: away['Yellow Cards'] ?? null,
    redCardsHome: home['Red Cards'] ?? null,
    redCardsAway: away['Red Cards'] ?? null,
    offsidesHome: home['Offsides'] ?? null,
    offsidesAway: away['Offsides'] ?? null,
    passesHome: home['Total passes'] ?? null,
    passesAway: away['Total passes'] ?? null,
  };
};

const toRosterEntry = (
  team: ApiFootballTeamReference,
  player: { id: number; name: string; pos?: string | null },
  starterFlag: boolean,
): NormalizedMatchPlayerInput => ({
  player: {
    externalApiId: player.id,
    name: player.name,
    nationality: null,
    position: player.pos ?? null,
    photo: null,
  },
  team: toTeamInput(team),
  isStarter: starterFlag,
  isSubstitute: !starterFlag,
  minutesPlayed: null,
  goals: null,
  assists: null,
  shots: null,
  keyPasses: null,
  yellowCards: null,
  redCards: null,
  rating: null,
});

export const mapFixtureLineups = (
  lineups: ApiFootballLineupResponse[],
): { lineups: NormalizedLineupInput[]; roster: NormalizedMatchPlayerInput[] } => {
  const mappedLineups: NormalizedLineupInput[] = [];
  const roster: NormalizedMatchPlayerInput[] = [];

  for (const lineup of lineups) {
    mappedLineups.push({
      team: toTeamInput(lineup.team),
      formation: lineup.formation ?? null,
      coachName: lineup.coach?.name ?? null,
    });

    for (const starter of lineup.startXI) {
      roster.push(toRosterEntry(lineup.team, starter.player, true));
    }

    for (const substitute of lineup.substitutes) {
      roster.push(toRosterEntry(lineup.team, substitute.player, false));
    }
  }

  return { lineups: mappedLineups, roster };
};

export const mapFixturePlayers = (
  playerStatistics: ApiFootballPlayerStatisticsResponse[],
): NormalizedMatchPlayerInput[] => {
  const mappedPlayers: NormalizedMatchPlayerInput[] = [];

  for (const teamEntry of playerStatistics) {
    for (const playerEntry of teamEntry.players) {
      const latestStats = playerEntry.statistics[0];

      mappedPlayers.push({
        player: {
          externalApiId: playerEntry.player.id,
          name: playerEntry.player.name,
          nationality: null,
          position: latestStats?.games?.position ?? null,
          photo: playerEntry.player.photo ?? null,
        },
        team: toTeamInput(teamEntry.team),
        isStarter: !(latestStats?.games?.substitute ?? false),
        isSubstitute: latestStats?.games?.substitute ?? false,
        minutesPlayed: latestStats?.games?.minutes ?? null,
        goals: latestStats?.goals?.total ?? null,
        assists: latestStats?.goals?.assists ?? null,
        shots: latestStats?.shots?.total ?? null,
        keyPasses: latestStats?.passes?.key ?? null,
        yellowCards: latestStats?.cards?.yellow ?? null,
        redCards: latestStats?.cards?.red ?? null,
        rating: parseNumericValue(latestStats?.games?.rating) ?? null,
      });
    }
  }

  return mappedPlayers;
};

export const mergeMatchPlayers = (
  lineupPlayers: NormalizedMatchPlayerInput[],
  playerStatistics: NormalizedMatchPlayerInput[],
): NormalizedMatchPlayerInput[] => {
  const mergedPlayers = new Map<string, NormalizedMatchPlayerInput>();

  const mergeIntoMap = (entry: NormalizedMatchPlayerInput): void => {
    const key = `${entry.team.externalApiId}:${entry.player.externalApiId}`;
    const existing = mergedPlayers.get(key);

    if (!existing) {
      mergedPlayers.set(key, entry);
      return;
    }

    mergedPlayers.set(key, {
      ...existing,
      player: {
        ...existing.player,
        ...entry.player,
        position: entry.player.position ?? existing.player.position,
        photo: entry.player.photo ?? existing.player.photo,
      },
      isStarter: existing.isStarter || entry.isStarter,
      isSubstitute: existing.isSubstitute || entry.isSubstitute,
      minutesPlayed: entry.minutesPlayed ?? existing.minutesPlayed,
      goals: entry.goals ?? existing.goals,
      assists: entry.assists ?? existing.assists,
      shots: entry.shots ?? existing.shots,
      keyPasses: entry.keyPasses ?? existing.keyPasses,
      yellowCards: entry.yellowCards ?? existing.yellowCards,
      redCards: entry.redCards ?? existing.redCards,
      rating: entry.rating ?? existing.rating,
    });
  };

  lineupPlayers.forEach(mergeIntoMap);
  playerStatistics.forEach(mergeIntoMap);

  return Array.from(mergedPlayers.values());
};

export const buildNormalizedMatchBundle = (params: {
  fixture: ApiFootballFixtureResponse;
  statistics: ApiFootballStatisticResponse[];
  lineups: ApiFootballLineupResponse[];
  players: ApiFootballPlayerStatisticsResponse[];
  manchesterUnitedTeamId: number;
}): NormalizedMatchBundle => {
  const match = mapFixtureToMatch(params.fixture, params.manchesterUnitedTeamId);
  const mappedStatistics = mapFixtureStatistics(
    params.statistics,
    match.homeTeam.externalApiId,
    match.awayTeam.externalApiId,
  );
  const mappedLineups = mapFixtureLineups(params.lineups);
  const mappedPlayers = mapFixturePlayers(params.players);

  return {
    match,
    statistics: mappedStatistics,
    lineups: mappedLineups.lineups,
    players: mergeMatchPlayers(mappedLineups.roster, mappedPlayers),
  };
};
