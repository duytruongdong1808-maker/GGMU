# GGMU Monorepo

Repo nay da duoc tach ro thanh `frontend/` va `backend/` de de maintain hon, tranh collision file tren Windows, va giu backend doc lap voi Vite app.

## Structure

```text
frontend/
  index.html
  public/
  src/
  tsconfig.json
  tsconfig.app.json
  tsconfig.node.json
  vite.config.ts
  postcss.config.cjs
  tailwind.config.cjs

backend/
  .env.example
  prisma/
    schema.prisma
  src/
    app.ts
    server.ts
    config/
    integrations/
    jobs/
    lib/
    middleware/
    modules/
    scripts/
    utils/
  tsconfig.json
```

## Commands

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

Additional commands:

```bash
npm run dev:frontend
npm run dev:backend
npm run build:frontend
npm run build:backend
npm run build
npm start
npm run sync:season -- --season=2025
```

## Backend Environment

Copy `backend/.env.example` to `backend/.env` and fill in:

- `DATABASE_URL`
- `FOOTBALL_DATA_API_KEY`
- `FOOTBALL_API_PROVIDER`
- `FOOTBALL_API_BASE_URL`
- `FOOTBALL_API_HOST`
- `FOOTBALL_API_KEY`
- `MANCHESTER_UNITED_TEAM_ID`
- `MATCH_SYNC_CRON`
- `MATCH_SYNC_TRIGGER_SECRET`

Provider presets:

- API-SPORTS direct
  - `FOOTBALL_API_PROVIDER=apisports`
  - `FOOTBALL_API_BASE_URL=https://v3.football.api-sports.io`
  - `FOOTBALL_API_HOST=v3.football.api-sports.io`
- RapidAPI
  - `FOOTBALL_API_PROVIDER=rapidapi`
  - `FOOTBALL_API_BASE_URL=https://api-football-v1.p.rapidapi.com/v3`
  - `FOOTBALL_API_HOST=api-football-v1.p.rapidapi.com`

## API Endpoints

```http
GET  /api/health
GET  /api/team
GET  /api/squad
POST /api/sync/matches?season=2025
GET  /api/matches
GET  /api/matches/search
GET  /api/matches/recent
GET  /api/matches/head-to-head
GET  /api/matches/:id
GET  /api/players/search
GET  /api/players/:id/matches
GET  /api/players/appearances-summary
```

## Notes

- Frontend nam trong `frontend/`.
- Backend nam trong `backend/`.
- Prisma schema nam trong `backend/prisma/schema.prisma`.
- Football API integration nam trong `backend/src/integrations/footballApi`.
- football-data.org live club integration nam trong `backend/src/integrations/footballData`.
- Sync van la idempotent thong qua Prisma `upsert`.
- `POST /api/sync/matches` la internal route: gui `X-Sync-Secret` hoac `Authorization: Bearer <secret>` va route co rate limit co ban theo config backend.
