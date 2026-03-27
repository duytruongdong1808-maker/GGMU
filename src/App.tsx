import { startTransition, useEffect, useState } from 'react';

import { LoadingState } from './components/LoadingState';
import { FormationBoard } from './components/FormationBoard';
import { PlayerCarousel } from './components/PlayerCarousel';
import { PlayerDetails } from './components/PlayerDetails';
import { StatusPanel } from './components/StatusPanel';
import { defaultActivePlayerIndex } from './data/players';
import { usePlayers } from './hooks/usePlayers';
import { wrapIndex } from './utils/carousel';

const featurePills = [
  'Desktop-first',
  'Keyboard navigation',
  'Smooth slide motion',
  '4-2-3-1 tactical board',
];

function App() {
  const { players, loading, error, retry } = usePlayers();
  const [activeIndex, setActiveIndex] = useState(
    defaultActivePlayerIndex >= 0 ? defaultActivePlayerIndex : 0,
  );

  useEffect(() => {
    if (players.length === 0) {
      return;
    }

    if (activeIndex > players.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, players.length]);

  useEffect(() => {
    if (players.length <= 1) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        startTransition(() => {
          setActiveIndex((current) => wrapIndex(current - 1, players.length));
        });
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        startTransition(() => {
          setActiveIndex((current) => wrapIndex(current + 1, players.length));
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [players.length]);

  const goPrevious = () => {
    startTransition(() => {
      setActiveIndex((current) => wrapIndex(current - 1, players.length));
    });
  };

  const goNext = () => {
    startTransition(() => {
      setActiveIndex((current) => wrapIndex(current + 1, players.length));
    });
  };

  const selectPlayer = (index: number) => {
    startTransition(() => {
      setActiveIndex(index);
    });
  };

  const activePlayer = players[activeIndex];

  return (
    <main className="min-h-screen overflow-hidden bg-hero-gradient text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-brand-gold/20 bg-black/[0.35] p-2 shadow-glow sm:h-20 sm:w-20">
                <img
                  src="/favicon-mu-48.png"
                  alt="Manchester United crest"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <p className="section-label">Manchester United</p>
                <h1 className="font-display text-5xl leading-none text-white sm:text-6xl lg:text-7xl">
                  First-Team Spotlight
                </h1>
              </div>
            </div>

            <p className="max-w-3xl text-base leading-8 text-white/[0.78] sm:text-lg">
              A premium, sports-inspired player carousel focused on the current Manchester United men&apos;s first-team squad.
              The center card owns the stage with stronger scale, richer contrast, and a live detail panel that updates as
              you move through the squad.
            </p>

            <div className="flex flex-wrap gap-3">
              {featurePills.map((pill) => (
                <span key={pill} className="stat-chip">
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <section className="glass-panel relative overflow-hidden p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(246,196,83,0.15),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(218,41,28,0.22),_transparent_42%)]" />
            <div className="relative space-y-5">
              <div>
                <p className="section-label">Live Focus</p>
                <h2 className="mt-2 font-display text-4xl leading-none text-white">
                  Modern Red Energy
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="rounded-[1.35rem] border border-white/10 bg-black/[0.35] p-4">
                  <p className="text-xs uppercase tracking-[0.32em] text-white/[0.45]">
                    Squad size
                  </p>
                  <p className="mt-3 font-display text-4xl leading-none text-brand-gold">
                    {loading ? '--' : String(players.length).padStart(2, '0')}
                  </p>
                </div>

                <div className="rounded-[1.35rem] border border-white/10 bg-black/[0.35] p-4">
                  <p className="text-xs uppercase tracking-[0.32em] text-white/[0.45]">
                    Center player
                  </p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    {activePlayer?.name ?? 'Loading squad'}
                  </p>
                </div>

                <div className="rounded-[1.35rem] border border-white/10 bg-black/[0.35] p-4">
                  <p className="text-xs uppercase tracking-[0.32em] text-white/[0.45]">
                    Season pulse
                  </p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    2025/26
                  </p>
                </div>
              </div>

              <p className="text-sm leading-7 text-white/70">
                Built with a mock data layer first, so it&apos;s easy to replace the service with a real API later without
                rewriting the carousel or detail components.
              </p>
            </div>
          </section>
        </header>

        <div className="mt-8 flex-1">
          {loading ? <LoadingState /> : null}

          {!loading && error ? (
            <StatusPanel
              title="Squad Feed Interrupted"
              description={error}
              actionLabel="Retry loading"
              onAction={retry}
            />
          ) : null}

          {!loading && !error && players.length === 0 ? (
            <StatusPanel
              title="No Players Available"
              description="The squad list came back empty. Retry the loader or plug in a fresh API response to repopulate the carousel."
              actionLabel="Reload squad"
              onAction={retry}
            />
          ) : null}

          {!loading && !error && players.length > 0 && activePlayer ? (
            <div className="space-y-6">
              <section className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
                <PlayerCarousel
                  players={players}
                  activeIndex={activeIndex}
                  onPrevious={goPrevious}
                  onNext={goNext}
                  onSelect={selectPlayer}
                />

                <PlayerDetails
                  player={activePlayer}
                  activeIndex={activeIndex}
                  totalPlayers={players.length}
                />
              </section>

              <FormationBoard />
            </div>
          ) : null}
        </div>

        <footer className="mt-8 border-t border-white/10 pt-5 text-sm text-white/[0.45]">
          Squad mock is structured for easy API replacement. Carousel interactions support both arrow buttons and keyboard left/right navigation.
        </footer>
      </div>
    </main>
  );
}

export default App;
