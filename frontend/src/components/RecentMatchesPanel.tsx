import { Link } from 'react-router-dom';

import { useRecentMatches } from '../hooks/useRecentMatches';
import { StandingsPanel } from './StandingsPanel';

const formatMatchDate = (value: string): string =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

export const RecentMatchesPanel = () => {
  const { matches, loading, error, retry } = useRecentMatches(6);

  return (
    <>
      <StandingsPanel />

      <section className="glass-panel relative mt-6 overflow-hidden p-5 sm:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(246,196,83,0.1),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(218,41,28,0.16),_transparent_34%)]" />

        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="section-label">Backend-connected</p>
              <h2 className="font-display text-3xl leading-none text-white sm:text-4xl">
                Recent Manchester United matches
              </h2>
            </div>
            <span className="badge-muted">GET /api/matches/recent</span>
          </div>

          {loading ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="panel-block min-h-40 animate-pulse bg-white/[0.04]" />
              ))}
            </div>
          ) : null}

          {!loading && error ? (
            <div className="panel-block mt-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-200/70">
                Recent matches unavailable
              </p>
              <p className="mt-3 text-sm leading-6 text-white/70">{error}</p>
              <button type="button" onClick={retry} className="button-secondary mt-4">
                Retry recent matches
              </button>
            </div>
          ) : null}

          {!loading && !error && matches.length === 0 ? (
            <div className="panel-block mt-5">
              <p className="text-sm leading-6 text-white/70">
                No synced matches are available yet. Run the backend migration and first sync to populate this section.
              </p>
            </div>
          ) : null}

          {!loading && !error && matches.length > 0 ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {matches.map((match) => (
                <Link
                  key={match.id}
                  to={`/matches/${match.id}`}
                  className="panel-block block transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="section-label">{match.competition.name}</p>
                      <h3 className="mt-2 font-display text-3xl leading-none text-white">
                        {match.teams.home.name}
                      </h3>
                      <p className="mt-2 text-sm text-white/60">vs {match.teams.away.name}</p>
                    </div>
                    <span className="badge-accent">{match.result ?? 'n/a'}</span>
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/45">Score</p>
                      <p className="mt-2 font-display text-4xl leading-none text-white">
                        {match.score.home ?? '-'} : {match.score.away ?? '-'}
                      </p>
                    </div>
                    <div className="text-right text-sm leading-6 text-white/68">
                      <p>{formatMatchDate(match.date)}</p>
                      <p>{match.venue ?? 'Venue unavailable'}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
};
