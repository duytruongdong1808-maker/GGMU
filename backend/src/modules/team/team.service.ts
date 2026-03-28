import { env } from '../../config/env.js';
import {
  footballDataClient,
  type FootballDataSquadMemberResponse,
  type FootballDataStandingsResponse,
  type FootballDataStandingsTableEntryResponse,
  type FootballDataTeamResponse,
} from '../../integrations/footballData/footballData.client.js';
import { HttpError } from '../../lib/httpError.js';
import { logger } from '../../lib/logger.js';
import { teamRepository } from './team.repository.js';

const isSquadPlayer = (member: FootballDataSquadMemberResponse): boolean =>
  member.role === 'PLAYER' || Boolean(member.position);

const positionOrder = ['Goalkeeper', 'Defence', 'Midfield', 'Offence'];

const getPositionRank = (position: string | null | undefined): number => {
  if (!position) {
    return positionOrder.length;
  }

  const rank = positionOrder.indexOf(position);
  return rank >= 0 ? rank : positionOrder.length;
};

const getPrimaryStandingsTable = (
  standings: FootballDataStandingsResponse['standings'],
): FootballDataStandingsTableEntryResponse[] => {
  const totalStandings =
    standings.find((entry) => entry.type === 'TOTAL' && entry.table.length > 0)
    ?? standings.find((entry) => entry.table.length > 0);

  if (!totalStandings) {
    throw new HttpError(502, 'Standings are unavailable from football-data.org right now.');
  }

  return totalStandings.table;
};

const toTeamResponse = (team: FootballDataTeamResponse) => {
  const squad = (team.squad ?? []).filter(isSquadPlayer);

  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    tla: team.tla,
    crest: team.crest,
    address: team.address,
    website: team.website,
    founded: team.founded,
    clubColors: team.clubColors,
    venue: team.venue,
    runningCompetitions: (team.runningCompetitions ?? []).map((competition) => ({
      id: competition.id,
      name: competition.name,
      code: competition.code,
      type: competition.type,
      emblem: competition.emblem,
    })),
    squadCount: squad.length,
    lastUpdated: team.lastUpdated ?? null,
  };
};

const toSquadResponse = (team: FootballDataTeamResponse) =>
  (team.squad ?? [])
    .filter(isSquadPlayer)
    .sort((left, right) => {
      const positionOffset = getPositionRank(left.position) - getPositionRank(right.position);

      if (positionOffset !== 0) {
        return positionOffset;
      }

      return left.name.localeCompare(right.name);
    })
    .map((player) => ({
      id: player.id,
      name: player.name,
      firstName: player.firstName ?? null,
      lastName: player.lastName ?? null,
      dateOfBirth: player.dateOfBirth ?? null,
      nationality: player.nationality ?? null,
      position: player.position ?? null,
      shirtNumber: player.shirtNumber ?? null,
    }));

export class TeamService {
  private async getCachedTeam(teamId = env.FOOTBALL_DATA_TEAM_ID): Promise<FootballDataTeamResponse> {
    const snapshot = await teamRepository.findSnapshot(teamId);
    const now = Date.now();

    if (snapshot && snapshot.expiresAt.getTime() > now) {
      return teamRepository.deserializeSnapshot(snapshot);
    }

    try {
      const team = await footballDataClient.fetchTeam(teamId);
      const expiresAt = new Date(now + env.TEAM_CACHE_TTL_MINUTES * 60 * 1000);

      await teamRepository.upsertSnapshot(teamId, team, expiresAt);

      return team;
    } catch (error) {
      if (snapshot) {
        logger.warn('Serving stale team snapshot after football-data.org failure', {
          teamId,
          fetchedAt: snapshot.fetchedAt.toISOString(),
          expiresAt: snapshot.expiresAt.toISOString(),
          providerMessage: error instanceof Error ? error.message : 'Unknown provider error',
        });

        return teamRepository.deserializeSnapshot(snapshot);
      }

      throw error;
    }
  }

  async getTeam() {
    const team = await this.getCachedTeam();

    return toTeamResponse(team);
  }

  async getSquad() {
    const team = await this.getCachedTeam();

    return toSquadResponse(team);
  }

  async getStandings() {
    const standings = await footballDataClient.fetchStandings();
    const table = getPrimaryStandingsTable(standings.standings);
    const manchesterUnited = table.find((entry) => entry.team.id === env.FOOTBALL_DATA_TEAM_ID);

    if (!manchesterUnited) {
      throw new HttpError(502, 'Manchester United could not be found in the current standings feed.');
    }

    return {
      competition: {
        id: standings.competition.id,
        name: standings.competition.name,
        code: standings.competition.code,
        type: standings.competition.type,
        emblem: standings.competition.emblem,
      },
      season: {
        id: standings.season.id,
        startDate: standings.season.startDate,
        endDate: standings.season.endDate,
        currentMatchday: standings.season.currentMatchday ?? null,
      },
      highlightedTeam: {
        id: manchesterUnited.team.id,
        name: manchesterUnited.team.name,
        shortName: manchesterUnited.team.shortName ?? null,
        tla: manchesterUnited.team.tla ?? null,
        crest: manchesterUnited.team.crest ?? null,
        position: manchesterUnited.position,
        playedGames: manchesterUnited.playedGames,
        points: manchesterUnited.points,
        won: manchesterUnited.won,
        draw: manchesterUnited.draw,
        lost: manchesterUnited.lost,
        goalsFor: manchesterUnited.goalsFor,
        goalsAgainst: manchesterUnited.goalsAgainst,
        goalDifference: manchesterUnited.goalDifference,
        form: manchesterUnited.form ?? null,
      },
      table: table.map((entry) => ({
        position: entry.position,
        team: {
          id: entry.team.id,
          name: entry.team.name,
          shortName: entry.team.shortName ?? null,
          tla: entry.team.tla ?? null,
          crest: entry.team.crest ?? null,
        },
        playedGames: entry.playedGames,
        points: entry.points,
        won: entry.won,
        draw: entry.draw,
        lost: entry.lost,
        goalsFor: entry.goalsFor,
        goalsAgainst: entry.goalsAgainst,
        goalDifference: entry.goalDifference,
        form: entry.form ?? null,
        isManchesterUnited: entry.team.id === manchesterUnited.team.id,
      })),
    };
  }
}

export const teamService = new TeamService();