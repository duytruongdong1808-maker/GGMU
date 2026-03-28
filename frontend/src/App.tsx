import { startTransition, useDeferredValue, useEffect, useState } from 'react';

import { FormationBoard } from './components/FormationBoard';
import { LoadingState } from './components/LoadingState';
import { PlayerCarousel } from './components/PlayerCarousel';
import { PlayerDetails } from './components/PlayerDetails';
import { RecentMatchesPanel } from './components/RecentMatchesPanel';
import { SquadControls } from './components/SquadControls';
import { SquadSummaryBar } from './components/SquadSummaryBar';
import { StatusPanel } from './components/StatusPanel';
import { usePlayers } from './hooks/usePlayers';
import { wrapIndex } from './utils/carousel';

const featurePills = [
  'Latest results',
  'Player spotlight',
  'Predicted XI',
  'Share this view',
];

const positionOrder = [
  'Goalkeepers',
  'Defenders',
  'Midfielders',
  'Forwards',
] as const;

const quickLinks = [
  { href: '#results', label: 'Results' },
  { href: '#squad', label: 'Squad' },
  { href: '#shape', label: 'Predicted XI' },
] as const;

const featuredPlayerName = 'Bruno Fernandes';

const readInitialViewState = () => {
  const params = new URLSearchParams(window.location.search);

  return {
    playerId: Number(params.get('player')) || 0,
    searchQuery: params.get('q') ?? '',
    positionFilter: params.get('position') ?? 'all',
    nationalityFilter: params.get('nationality') ?? 'all',
    sortBy: params.get('sort') ?? 'spotlight',
  };
};

const initialViewState = readInitialViewState();

function App() {
  const { players, loading, error, retry } = usePlayers();
  const [selectedPlayerId, setSelectedPlayerId] = useState(initialViewState.playerId);
  const [searchQuery, setSearchQuery] = useState(initialViewState.searchQuery);
  const [positionFilter, setPositionFilter] = useState(initialViewState.positionFilter);
  const [nationalityFilter, setNationalityFilter] = useState(initialViewState.nationalityFilter);
  const [sortBy, setSortBy] = useState(initialViewState.sortBy);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
  const positions = positionOrder.filter((position) =>
    players.some((player) => player.positionGroup === position),
  );
  const nationalities = Array.from(
    new Set(players.map((player) => player.nationality)),
  ).sort((left, right) => left.localeCompare(right));

  let filteredPlayers = players.filter((player) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [
        player.name,
        player.position,
        player.positionGroup,
        player.previousClub,
        player.nationality,
        player.bio,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);

    const matchesPosition =
      positionFilter === 'all' || player.positionGroup === positionFilter;
    const matchesNationality =
      nationalityFilter === 'all' || player.nationality === nationalityFilter;

    return matchesQuery && matchesPosition && matchesNationality;
  });

  if (sortBy === 'name') {
    filteredPlayers = [...filteredPlayers].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }

  if (sortBy === 'youngest') {
    filteredPlayers = [...filteredPlayers].sort((left, right) => left.age - right.age);
  }

  if (sortBy === 'oldest') {
    filteredPlayers = [...filteredPlayers].sort((left, right) => right.age - left.age);
  }

  const activeIndex = filteredPlayers.findIndex(
    (player) => player.id === selectedPlayerId,
  );
  const activePlayer =
    activeIndex >= 0 ? filteredPlayers[activeIndex] : filteredPlayers[0];
  const visibleAverageAge =
    filteredPlayers.length > 0
      ? filteredPlayers.reduce((sum, player) => sum + player.age, 0) / filteredPlayers.length
      : 0;
  const starterCount = players.filter((player) => player.formationLane).length;

  useEffect(() => {
    if (players.length === 0) {
      return;
    }

    const hasSelectedPlayer = players.some((player) => player.id === selectedPlayerId);

    if (!hasSelectedPlayer) {
      const featuredPlayer = players.find((player) => player.name === featuredPlayerName);
      setSelectedPlayerId(featuredPlayer?.id ?? players[0].id);
    }
  }, [players, selectedPlayerId]);

  useEffect(() => {
    if (filteredPlayers.length === 0) {
      return;
    }

    if (!activePlayer) {
      setSelectedPlayerId(filteredPlayers[0].id);
    }
  }, [activePlayer, filteredPlayers]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (activePlayer?.id) {
      params.set('player', String(activePlayer.id));
    }

    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }

    if (positionFilter !== 'all') {
      params.set('position', positionFilter);
    }

    if (nationalityFilter !== 'all') {
      params.set('nationality', nationalityFilter);
    }

    if (sortBy !== 'spotlight') {
      params.set('sort', sortBy);
    }

    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `?${nextQuery}` : window.location.pathname;
    window.history.replaceState({}, '', nextUrl);
  }, [activePlayer?.id, nationalityFilter, positionFilter, searchQuery, sortBy]);

  const goPrevious = () => {
    if (!activePlayer || filteredPlayers.length <= 1) {
      return;
    }

    startTransition(() => {
      const nextIndex = wrapIndex(activeIndex - 1, filteredPlayers.length);
      setSelectedPlayerId(filteredPlayers[nextIndex].id);
    });
  };

  const goNext = () => {
    if (!activePlayer || filteredPlayers.length <= 1) {
      return;
    }

    startTransition(() => {
      const nextIndex = wrapIndex(activeIndex + 1, filteredPlayers.length);
      setSelectedPlayerId(filteredPlayers[nextIndex].id);
    });
  };

  const selectPlayerByIndex = (index: number) => {
    const selectedPlayer = filteredPlayers[index];

    if (!selectedPlayer) {
      return;
    }

    startTransition(() => {
      setSelectedPlayerId(selectedPlayer.id);
    });
  };

  const selectPlayerById = (playerId: number) => {
    startTransition(() => {
      setSelectedPlayerId(playerId);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      setSearchQuery('');
      setPositionFilter('all');
      setNationalityFilter('all');
      setSortBy('spotlight');
    });
  };

  const showFilteredEmptyState =
    !loading &&
    !error &&
    players.length > 0 &&
    filteredPlayers.length === 0;

  return (
    <main className="min-h-screen overflow-hidden bg-hero-gradient text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-black/[0.3] px-4 py-3 shadow-glow backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-gold/20 bg-black/[0.35] p-2">
                <img
                  src="/favicon-mu-48.png"
                  alt="Manchester United crest"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <p className="section-label">Home</p>
                <p className="text-sm font-semibold text-white/80 sm:text-base">
                  GGMU supporter hub
                </p>
              </div>
            </div>

            <nav aria-label="Primary" className="flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <a key={link.href} href={link.href} className="button-secondary !px-3 !py-2">
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.15rem] border border-brand-gold/20 bg-black/[0.35] p-2 shadow-glow sm:h-16 sm:w-16">
                  <img
                    src="/favicon-mu-48.png"
                    alt="Manchester United crest"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <p className="section-label">Manchester United home</p>
                  <h1 className="font-display text-4xl leading-none text-white sm:text-5xl lg:text-6xl">
                    Matchday Hub
                  </h1>
                </div>
              </div>

              <p className="max-w-3xl text-base leading-8 text-white/[0.78] sm:text-lg">
                Follow recent results, move through the first-team squad, and check a projected XI without leaving the
                homepage. It is a faster, more fan-facing way to get the shape of United in one stop.
              </p>

              <div className="flex flex-wrap gap-3">
                <a href="#results" className="button-primary">
                  View latest results
                </a>
                <a href="#squad" className="button-secondary">
                  Browse the squad
                </a>
                <a href="#shape" className="button-secondary">
                  See the XI board
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {featurePills.map((pill) => (
                <span key={pill} className="stat-chip">
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <SquadSummaryBar
            visibleCount={filteredPlayers.length}
            totalCount={players.length}
            averageAge={visibleAverageAge}
            activePlayerName={activePlayer?.name ?? 'Loading squad'}
            activePlayerPosition={activePlayer?.position ?? 'Awaiting selection'}
            starterCount={starterCount}
          />
        </header>

        <section id="results" className="mt-6">
          <RecentMatchesPanel />
        </section>

        <div className="mt-6 flex-1 space-y-6">
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
              title="Squad List Unavailable"
              description="We could not show the current first-team group just now. Reload the squad and try again."
              actionLabel="Reload squad"
              onAction={retry}
            />
          ) : null}

          {!loading && !error && players.length > 0 ? (
            <section id="squad" className="space-y-6">
              <SquadControls
                searchQuery={searchQuery}
                positionFilter={positionFilter}
                nationalityFilter={nationalityFilter}
                sortBy={sortBy}
                visibleCount={filteredPlayers.length}
                totalCount={players.length}
                positions={positions}
                nationalities={nationalities}
                onSearchChange={setSearchQuery}
                onPositionChange={setPositionFilter}
                onNationalityChange={setNationalityFilter}
                onSortChange={setSortBy}
                onClearFilters={clearFilters}
              />

              {showFilteredEmptyState ? (
                <StatusPanel
                  title="No Players Match This View"
                  description="Try a broader search, switch the filters back to all groups, or reset the view to return to the full squad."
                  actionLabel="Reset filters"
                  onAction={clearFilters}
                />
              ) : null}

              {!showFilteredEmptyState && activePlayer ? (
                <div className="space-y-6">
                  <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
                    <PlayerCarousel
                      players={filteredPlayers}
                      activeIndex={activeIndex}
                      onPrevious={goPrevious}
                      onNext={goNext}
                      onSelect={selectPlayerByIndex}
                    />

                    <PlayerDetails
                      player={activePlayer}
                      activeIndex={activeIndex}
                      totalPlayers={filteredPlayers.length}
                      players={filteredPlayers}
                      onSelectPlayer={selectPlayerById}
                    />
                  </section>

                  <div id="shape">
                    <FormationBoard
                      players={players}
                      activePlayerId={activePlayer.id}
                    />
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>

        <footer className="mt-8 border-t border-white/10 pt-5 text-sm leading-7 text-white/[0.45]">
          Recent results, squad context, and a projected XI now live together in one Manchester United home screen.
        </footer>
      </div>
    </main>
  );
}

export default App;





