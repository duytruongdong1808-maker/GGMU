import { Link, useParams } from 'react-router-dom';

import { StatusPanel } from '../components/StatusPanel';
import { useMatchDetail } from '../hooks/useMatchDetail';
import type { MatchLineupPlayer, MatchStatisticSide } from '../types/match';

const formatMatchDateTime = (value: string): string =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const statisticRows: Array<{ key: keyof MatchStatisticSide; label: string }> = [
  { key: 'possession', label: 'Possession' },
  { key: 'shots', label: 'Shots' },
  { key: 'shotsOnTarget', label: 'Shots on target' },
  { key: 'corners', label: 'Corners' },
  { key: 'fouls', label: 'Fouls' },
  { key: 'yellowCards', label: 'Yellow cards' },
  { key: 'redCards', label: 'Red cards' },
  { key: 'offsides', label: 'Offsides' },
  { key: 'passes', label: 'Passes' },
];

const renderLineupGroup = (title: string, players: MatchLineupPlayer[]) => (
  <div className="panel-block">
    <p className="section-label">{title}</p>
    {players.length > 0 ? (
      <div className="mt-3 flex flex-wrap gap-2">
        {players.map((player) => (
          <span key={player.id} className="badge-muted">
            {player.name}
          </span>
        ))}
      </div>
    ) : (
      <p className="mt-3 text-sm leading-6 text-white/60">Not available for this match.</p>
    )}
  </div>
);

export const MatchDetailPage = () => {
  const params = useParams();
  const matchId = params.id ? Number(params.id) : Number.NaN;
  const { match, loading, error, retry } = useMatchDetail(Number.isNaN(matchId) ? null : matchId);

  if (loading) {
    return (
      <main className="min-h-screen bg-hero-gradient px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl animate-pulse space-y-4">
          <div className="glass-panel h-36" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="glass-panel h-72" />
            <div className="glass-panel h-72" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !match) {
    return (
      <main className="min-h-screen bg-hero-gradient px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-5">
          <Link to="/" className="button-secondary inline-flex items-center gap-2">
            Back to home
          </Link>
          <StatusPanel
            title="Match detail unavailable"
            description={error ?? 'This match could not be loaded.'}
            actionLabel="Retry match detail"
            onAction={retry}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-hero-gradient px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="button-secondary inline-flex items-center gap-2">
            Back to home
          </Link>
          <span className="badge-muted">Match centre</span>
        </div>

        <section className="glass-panel overflow-hidden p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="section-label">{match.basicInfo.competition}</p>
              <h1 className="mt-3 font-display text-4xl leading-none text-white sm:text-5xl lg:text-6xl">
                {match.basicInfo.homeTeam} vs {match.basicInfo.awayTeam}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-white/70">
                {formatMatchDateTime(match.basicInfo.date)} at {match.basicInfo.venue ?? 'venue unavailable'}.
                Status: {match.basicInfo.status}.
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.28em] text-white/50">Final score</p>
              <p className="mt-3 font-display text-6xl leading-none text-white sm:text-7xl">
                {match.basicInfo.score.home ?? '-'} : {match.basicInfo.score.away ?? '-'}
              </p>
              <div className="mt-3 flex justify-end gap-2">
                <span className="badge-accent">{match.basicInfo.homeAway}</span>
                <span className="badge-muted">{match.basicInfo.result ?? 'n/a'}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-panel p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-label">Match statistics</p>
                <h2 className="mt-2 font-display text-3xl leading-none text-white">Manchester United vs opponent</h2>
              </div>
            </div>

            {match.statistics.manchesterUnited && match.statistics.opponent ? (
              <div className="mt-6 space-y-3">
                {statisticRows.map((row) => (
                  <div key={row.key} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 rounded-[1.2rem] border border-white/10 bg-black/[0.2] px-4 py-3">
                    <span className="text-left text-lg font-semibold text-white">{match.statistics.manchesterUnited?.[row.key] ?? '-'}</span>
                    <span className="text-center text-[0.68rem] uppercase tracking-[0.26em] text-white/50">{row.label}</span>
                    <span className="text-right text-lg font-semibold text-white">{match.statistics.opponent?.[row.key] ?? '-'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm leading-6 text-white/60">Statistics are not available for this match.</p>
            )}
          </div>

          <div className="glass-panel p-6 sm:p-7">
            <p className="section-label">Players who played</p>
            <h2 className="mt-2 font-display text-3xl leading-none text-white">Manchester United participants</h2>
            {match.playersWhoPlayed.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {match.playersWhoPlayed.map((player) => (
                  <span key={player.id} className="badge-muted">
                    {player.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-white/60">Player participation data is not available for this match.</p>
            )}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="glass-panel p-6 sm:p-7">
            <p className="section-label">Lineup</p>
            <h2 className="mt-2 font-display text-3xl leading-none text-white">Manchester United</h2>
            <div className="mt-5 grid gap-3">
              <div className="panel-block">
                <p className="panel-label">Formation</p>
                <p className="mt-3 text-lg font-semibold text-white">{match.lineup.manchesterUnited.formation ?? 'Unavailable'}</p>
              </div>
              <div className="panel-block">
                <p className="panel-label">Coach</p>
                <p className="mt-3 text-lg font-semibold text-white">{match.lineup.manchesterUnited.coach ?? 'Unavailable'}</p>
              </div>
              {renderLineupGroup('Starting XI', match.lineup.manchesterUnited.startingXI)}
              {renderLineupGroup('Substitutes', match.lineup.manchesterUnited.substitutes)}
            </div>
          </div>

          <div className="glass-panel p-6 sm:p-7">
            <p className="section-label">Lineup</p>
            <h2 className="mt-2 font-display text-3xl leading-none text-white">Opponent</h2>
            <div className="mt-5 grid gap-3">
              <div className="panel-block">
                <p className="panel-label">Formation</p>
                <p className="mt-3 text-lg font-semibold text-white">{match.lineup.opponent.formation ?? 'Unavailable'}</p>
              </div>
              <div className="panel-block">
                <p className="panel-label">Coach</p>
                <p className="mt-3 text-lg font-semibold text-white">{match.lineup.opponent.coach ?? 'Unavailable'}</p>
              </div>
              {renderLineupGroup('Starting XI', match.lineup.opponent.startingXI)}
              {renderLineupGroup('Substitutes', match.lineup.opponent.substitutes)}
            </div>
          </div>
        </section>

        <section className="glass-panel p-6 sm:p-7">
          <p className="section-label">Player match stats</p>
          <h2 className="mt-2 font-display text-3xl leading-none text-white">Manchester United player outputs</h2>
          {match.playerMatchStats.length > 0 ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {match.playerMatchStats.map((player) => (
                <article key={player.id} className="panel-block">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{player.name}</h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/45">{player.position ?? 'Position unavailable'}</p>
                    </div>
                    <span className="badge-muted">{player.isStarter ? 'starter' : 'sub'}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/72">
                    <span>Minutes: {player.minutes ?? '-'}</span>
                    <span>Goals: {player.goals ?? 0}</span>
                    <span>Assists: {player.assists ?? 0}</span>
                    <span>Shots: {player.shots ?? 0}</span>
                    <span>Key passes: {player.keyPasses ?? 0}</span>
                    <span>Rating: {player.rating ?? '-'}</span>
                    <span>Yellow: {player.yellowCards ?? 0}</span>
                    <span>Red: {player.redCards ?? 0}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-white/60">Player-level match stats are not available for this match.</p>
          )}
        </section>
      </div>
    </main>
  );
};
