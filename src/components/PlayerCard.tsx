import type { Player } from '../types/player';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  offset: number;
  onClick: () => void;
}

export const PlayerCard = ({
  player,
  isActive,
  offset,
  onClick,
}: PlayerCardProps) => {
  const isNearCenter = Math.abs(offset) <= 1;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className="group h-full w-full text-left"
    >
      <article
        className={`relative h-full overflow-hidden rounded-[1.85rem] border p-4 transition duration-500 sm:p-5 ${
          isActive
            ? 'border-brand-gold/[0.35] bg-gradient-to-b from-brand-red/30 via-black/75 to-black shadow-glow-strong'
            : 'border-white/10 bg-gradient-to-b from-white/10 via-black/75 to-black/90 shadow-card'
        }`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br transition duration-500 ${
            isActive
              ? 'from-brand-red/[0.24] via-transparent to-brand-gold/10 opacity-100'
              : 'from-white/[0.08] via-transparent to-transparent opacity-70'
          }`}
        />
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/60">
            <span>MUFC</span>
            <span>{isActive ? 'Spotlight' : isNearCenter ? 'Ready' : 'Bench'}</span>
          </div>

          <div
            className={`relative mt-4 overflow-hidden rounded-[1.5rem] border transition duration-500 ${
              isActive
                ? 'border-brand-gold/20 bg-[radial-gradient(circle_at_top,_rgba(246,196,83,0.22),_transparent_28%),linear-gradient(180deg,rgba(218,41,28,0.38),rgba(8,8,8,0.9))]'
                : 'border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_28%),linear-gradient(180deg,rgba(60,60,60,0.28),rgba(8,8,8,0.92))]'
            }`}
          >
            <div className="pointer-events-none absolute inset-x-0 top-16 h-20 bg-[radial-gradient(circle,_rgba(255,255,255,0.16),_transparent_68%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            <img
              src={player.image}
              alt={player.name}
              loading="lazy"
              className={`relative h-56 w-full object-contain object-bottom px-3 pt-3 transition duration-500 sm:h-64 sm:px-4 sm:pt-4 ${
                isActive
                  ? 'scale-[1.03] drop-shadow-[0_22px_26px_rgba(0,0,0,0.42)]'
                  : 'scale-100 saturate-90 opacity-90'
              }`}
            />
          </div>

          <div className="mt-5 space-y-3">
            <div>
              <p
                className={`font-display leading-none text-white ${
                  isActive ? 'text-4xl sm:text-[2.65rem]' : 'text-3xl'
                }`}
              >
                {player.name}
              </p>
              <p className="mt-2 text-sm uppercase tracking-[0.32em] text-white/[0.55]">
                {player.position}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                {player.nationality}
              </span>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-brand-gold/20 bg-brand-red/[0.15] px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-brand-gold">
                  {player.positionCode}
                </span>
                <span className="text-sm font-medium text-white/[0.55]">
                  Age {player.age}
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </button>
  );
};
