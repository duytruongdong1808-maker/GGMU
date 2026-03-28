import type { Player } from '../types/player';

interface PlayerDetailsProps {
  player: Player;
  activeIndex: number;
  totalPlayers: number;
  players: Player[];
  onSelectPlayer: (playerId: number) => void;
}

export const PlayerDetails = ({
  player,
  activeIndex,
  totalPlayers,
  players,
  onSelectPlayer,
}: PlayerDetailsProps) => {
  const details = [
    { label: 'Squad role', value: player.position },
    { label: 'Age', value: `${player.age}` },
    { label: 'Born', value: `${player.birthYear}` },
    { label: 'Country', value: player.nationality },
    { label: 'Previous Club', value: player.previousClub },
    { label: 'Unit', value: player.positionGroup },
  ];

  return (
    <aside
      key={player.id}
      className="glass-panel animate-fade-up relative overflow-hidden p-5 sm:p-6"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(246,196,83,0.12),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(218,41,28,0.2),_transparent_38%)]" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="section-label">Player profile</p>
          <span className="badge-accent">
            {String(activeIndex + 1).padStart(2, '0')} / {String(totalPlayers).padStart(2, '0')}
          </span>
        </div>

        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-accent">
              {player.positionCode}
            </span>
            <span className="badge-muted">
              {player.position}
            </span>
            <span className="badge-muted">
              {player.nationality}
            </span>
          </div>

          <h3 className="mt-4 font-display text-4xl leading-none text-white sm:text-5xl lg:text-6xl">
            {player.name}
          </h3>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/74">
            {player.bio}
          </p>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {details.map((detail) => (
            <div
              key={detail.label}
              className="panel-block"
            >
              <p className="panel-label">
                {detail.label}
              </p>
              <p className="mt-3 text-lg font-semibold leading-tight text-white">
                {detail.value}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="section-label">Squad picks</p>
              <h4 className="mt-2 font-display text-3xl leading-none text-white">
                Jump around the squad
              </h4>
            </div>
            <p className="text-sm text-white/56">
              Stay in the same view while you compare players.
            </p>
          </div>

          <div className="mt-4 flex max-h-56 flex-wrap gap-2 overflow-y-auto pr-1">
            {players.map((squadPlayer) => (
              <button
                key={squadPlayer.id}
                type="button"
                onClick={() => onSelectPlayer(squadPlayer.id)}
                className={`rounded-2xl border px-3 py-2 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                  squadPlayer.id === player.id
                    ? 'border-brand-gold/40 bg-brand-red/22 text-white shadow-glow'
                    : 'border-white/10 bg-white/5 text-white/76 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <span className="block text-sm font-semibold">
                  {squadPlayer.name}
                </span>
                <span className="mt-1 block text-[0.68rem] uppercase tracking-[0.24em] text-white/52">
                  {squadPlayer.positionCode}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
};
