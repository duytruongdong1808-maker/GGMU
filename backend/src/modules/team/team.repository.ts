import { Prisma, type TeamSnapshot } from '@prisma/client';

import type { FootballDataTeamResponse } from '../../integrations/footballData/footballData.client.js';
import { prisma, type DatabaseClient } from '../../lib/prisma.js';

const toSnapshotPayload = (payload: FootballDataTeamResponse): Prisma.InputJsonValue =>
  payload as unknown as Prisma.InputJsonValue;

const fromSnapshotPayload = (payload: Prisma.JsonValue): FootballDataTeamResponse =>
  payload as unknown as FootballDataTeamResponse;

export class TeamRepository {
  constructor(private readonly db: DatabaseClient = prisma) {}

  async findSnapshot(teamExternalApiId: number): Promise<TeamSnapshot | null> {
    return this.db.teamSnapshot.findUnique({
      where: { teamExternalApiId },
    });
  }

  async upsertSnapshot(
    teamExternalApiId: number,
    payload: FootballDataTeamResponse,
    expiresAt: Date,
  ): Promise<TeamSnapshot> {
    const fetchedAt = new Date();

    return this.db.teamSnapshot.upsert({
      where: { teamExternalApiId },
      create: {
        teamExternalApiId,
        payload: toSnapshotPayload(payload),
        fetchedAt,
        expiresAt,
      },
      update: {
        payload: toSnapshotPayload(payload),
        fetchedAt,
        expiresAt,
      },
    });
  }

  deserializeSnapshot(snapshot: TeamSnapshot): FootballDataTeamResponse {
    return fromSnapshotPayload(snapshot.payload);
  }
}

export const teamRepository = new TeamRepository();
