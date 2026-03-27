import type { Player } from '../types/player';

interface PlayerDetailsProps {
  player: Player;
  activeIndex: number;
  totalPlayers: number;
}

export const PlayerDetails = ({
  player,
  activeIndex,
  totalPlayers,
}: PlayerDetailsProps) => {
  const details = [
    { label: 'Role Code', value: player.positionCode },
    { label: 'Age', value: `${player.age}` },
    { label: 'Birth Year', value: `${player.birthYear}` },
    { label: 'Nationality', value: player.nationality },
    { label: 'Previous Club', value: player.previousClub },
    { label: 'Position', value: player.position },
  ];

  return (
    <aside
      key={player.id}
      className="glass-panel animate-fade-up relative overflow-hidden p-6 sm:p-7"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(246,196,83,0.12),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(218,41,28,0.2),_transparent_38%)]" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="section-label">Center Card Details</p>
          <span className="rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-brand-gold">
            {String(activeIndex + 1).padStart(2, '0')} / {String(totalPlayers).padStart(2, '0')}
          </span>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-red/80">
            Current spotlight
          </p>
          <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-brand-gold/20 bg-brand-red/[0.15] px-4 py-2">
            <span className="font-display text-3xl leading-none text-brand-gold">
              {player.positionCode}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/[0.65]">
              Active role
            </span>
          </div>
          <h3 className="mt-2 font-display text-5xl leading-none text-white sm:text-6xl">
            {player.name}
          </h3>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/70">
            Premium focus card for the current Manchester United first-team player in the center position.
            Move left or right and the detail panel updates instantly with the new focal player.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {details.map((detail) => (
            <div
              key={detail.label}
              className="rounded-[1.4rem] border border-white/10 bg-black/[0.35] p-4 shadow-glow"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/[0.45]">
                {detail.label}
              </p>
              <p className="mt-3 text-lg font-semibold leading-tight text-white">
                {detail.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[1.6rem] border border-brand-red/20 bg-brand-red/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
            Matchday note
          </p>
          <p className="mt-3 text-sm leading-7 text-white/75">
            The center card is intentionally brighter, larger, and sharper than the side cards to keep the
            carousel focus obvious on desktop, tablet, and mobile.
          </p>
        </div>
      </div>
    </aside>
  );
};
