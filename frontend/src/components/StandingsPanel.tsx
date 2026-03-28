import { useStandings } from '../hooks/useStandings';
import type { StandingsRow } from '../types/standings';

const formatGoalDifference = (value: number): string => (value > 0 ? `+${value}` : String(value));

const getPositionSuffix = (position: number): string => {
  const remainder = position % 10;
  const teen = position % 100;

  if (teen >= 11 && teen <= 13) {
    return 'th';
  }

  if (remainder === 1) {
    return 'st';
  }

  if (remainder === 2) {
    return 'nd';
  }

  if (remainder === 3) {
    return 'rd';
  }

  return 'th';
};

const buildContextRows = (table: StandingsRow[], highlightedPosition: number): Array<StandingsRow | 'gap'> => {
  const positionsToShow = new Set<number>();

  for (const row of table) {
    if (row.position <= 4) {
      positionsToShow.add(row.position);
    }
  }

  positionsToShow.add(highlightedPosition);
  positionsToShow.add(highlightedPosition - 1);
  positionsToShow.add(highlightedPosition + 1);

  const rows = table
    .filter((row) => positionsToShow.has(row.position))
    .sort((left, right) => left.position - right.position);

  const visibleRows: Array<StandingsRow | 'gap'> = [];

  rows.forEach((row, index) => {
    const previousRow = rows[index - 1];

    if (previousRow && row.position - previousRow.position > 1) {
      visibleRows.push('gap');
    }

    visibleRows.push(row);
  });

  return visibleRows;
};

export const StandingsPanel = () => {
  const { standings, loading, error, retry } = useStandings();

  if (loading) {
    return (
      <section className="glass-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-label">League snapshot</p>
            <h2 className="font-display text-3xl leading-none text-white sm:text-4xl">
              League position
            </h2>
          </div>
          <span className="badge-muted">GET /api/standings</span>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="panel-block min-h-56 animate-pulse bg-white/[0.04]" />
          <div className="panel-block min-h-56 animate-pulse bg-white/[0.04]" />
        </div>
      </section>
    );
  }

  if (error || !standings) {
    return (
      <section className="glass-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-label">League snapshot</p>
            <h2 className="font-display text-3xl leading-none text-white sm:text-4xl">
              League position
            </h2>
          </div>
          <span className="badge-muted">GET /api/standings</span>
        </div>

        <div className="panel-block mt-5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-200/70">
            Standings unavailable
          </p>
          <p className="mt-3 text-sm leading-6 text-white/70">
            {error ?? 'The league table could not be loaded right now.'}
          </p>
          <button type="button" onClick={retry} className="button-secondary mt-4">
            Retry standings
          </button>
        </div>
      </section>
    );
  }

  const { competition, highlightedTeam, season, table } = standings;
  const contextRows = buildContextRows(table, highlightedTeam.position);

  return (
    <section className="glass-panel relative overflow-hidden p-5 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(218,41,28,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(246,196,83,0.12),_transparent_34%)]" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-label">League snapshot</p>
            <h2 className="font-display text-3xl leading-none text-white sm:text-4xl">
              {competition.name} position
            </h2>
          </div>
          <span className="badge-muted">GET /api/standings</span>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="panel-block">
            <p className="panel-label">Manchester United</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="font-display text-6xl leading-none text-white">
                  {highlightedTeam.position}
                  <span className="text-2xl text-brand-gold">
                    {getPositionSuffix(highlightedTeam.position)}
                  </span>
                </p>
                <p className="mt-3 text-sm uppercase tracking-[0.28em] text-white/55">
                  {highlightedTeam.points} points after {highlightedTeam.playedGames} matches
                </p>
              </div>

              <div className="rounded-2xl border border-brand-gold/20 bg-brand-red/[0.14] px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-brand-gold/70">Goal difference</p>
                <p className="mt-2 font-display text-3xl leading-none text-white">
                  {formatGoalDifference(highlightedTeam.goalDifference)}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="panel-label">Record</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {highlightedTeam.won}-{highlightedTeam.draw}-{highlightedTeam.lost}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="panel-label">Goals</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {highlightedTeam.goalsFor} for / {highlightedTeam.goalsAgainst} against
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="panel-label">Current round</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {season.currentMatchday ? `Matchday ${season.currentMatchday}` : 'In progress'}
                </p>
              </div>
            </div>
          </div>

          <div className="panel-block">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="panel-label">Table context</p>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  Top-four race plus the rows around United so the current position has real league context.
                </p>
              </div>
              <span className="badge-accent">Pld / GD / Pts</span>
            </div>

            <div className="mt-5 space-y-2">
              {contextRows.map((row, index) =>
                row === 'gap' ? (
                  <div
                    key={`gap-${index}`}
                    className="rounded-2xl border border-dashed border-white/10 px-4 py-2 text-center text-xs uppercase tracking-[0.28em] text-white/35"
                  >
                    More places between
                  </div>
                ) : (
                  <div
                    key={row.team.id}
                    className={`grid grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] items-center gap-3 rounded-2xl border px-4 py-3 ${
                      row.isManchesterUnited
                        ? 'border-brand-gold/25 bg-brand-red/[0.16] shadow-glow'
                        : 'border-white/10 bg-white/[0.04]'
                    }`}
                  >
                    <div className="font-display text-2xl leading-none text-white">{row.position}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{row.team.shortName ?? row.team.name}</p>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                        {row.isManchesterUnited ? 'Manchester United' : row.team.tla ?? 'Club'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/35">Pld</p>
                      <p className="mt-1 text-sm font-semibold text-white">{row.playedGames}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/35">GD</p>
                      <p className="mt-1 text-sm font-semibold text-white">{formatGoalDifference(row.goalDifference)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/35">Pts</p>
                      <p className="mt-1 text-sm font-semibold text-white">{row.points}</p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

