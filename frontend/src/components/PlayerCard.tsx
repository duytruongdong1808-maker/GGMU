import { useState } from 'react';

import clubMark from '../assets/club-mark.svg';
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
  const [imageFailed, setImageFailed] = useState(false);
  const isNearCenter = Math.abs(offset) <= 1;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className="group h-full w-full rounded-[1.75rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <article
        className={`relative h-full overflow-hidden rounded-[1.75rem] border px-4 py-4 transition duration-500 sm:px-5 sm:py-5 ${
          isActive
            ? 'border-brand-gold/45 bg-[linear-gradient(180deg,rgba(218,41,28,0.28),rgba(7,7,7,0.96))] shadow-glow-strong'
            : 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(6,6,6,0.95))] shadow-card'
        }`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br transition duration-500 ${
            isActive
              ? 'from-brand-red/20 via-transparent to-brand-gold/10'
              : 'from-white/[0.06] via-transparent to-transparent'
          }`}
        />
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 text-[0.64rem] font-semibold uppercase tracking-[0.32em] text-white/60">
            <span>{player.positionGroup}</span>
            <span>{isActive ? 'Selected' : isNearCenter ? 'Nearby' : 'Queue'}</span>
          </div>

          <div
            className={`relative mt-4 overflow-hidden rounded-[1.45rem] border transition duration-500 ${
              isActive
                ? 'border-brand-gold/20 bg-[radial-gradient(circle_at_top,_rgba(246,196,83,0.18),_transparent_28%),linear-gradient(180deg,rgba(218,41,28,0.26),rgba(8,8,8,0.92))]'
                : 'border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.07),_transparent_28%),linear-gradient(180deg,rgba(48,48,48,0.22),rgba(8,8,8,0.95))]'
            }`}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle,_rgba(255,255,255,0.18),_transparent_70%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
            <img
              src={imageFailed ? clubMark : player.image}
              alt={imageFailed ? `Manchester United placeholder for ${player.name}` : player.name}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className={`relative h-52 w-full object-contain object-bottom px-4 pt-4 transition duration-500 sm:h-64 ${
                imageFailed
                  ? 'opacity-50 saturate-0'
                  : isActive
                    ? 'scale-[1.02] drop-shadow-[0_22px_26px_rgba(0,0,0,0.42)]'
                    : 'scale-100 saturate-90 opacity-90'
              }`}
            />
            {imageFailed ? (
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/72">
                Portrait unavailable
              </span>
            ) : null}
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <p
                className={`font-display leading-none text-white ${
                  isActive ? 'text-[2.35rem] sm:text-[2.7rem]' : 'text-[2rem]'
                }`}
              >
                {player.name}
              </p>
              <p className="mt-2 text-sm uppercase tracking-[0.28em] text-white/58">
                {player.position}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="badge-muted">
                {player.nationality}
              </span>
              <span className="badge-muted">
                Age {player.age}
              </span>
              <span className="badge-accent">
                {player.positionCode}
              </span>
            </div>

            <p className="text-sm leading-6 text-white/64">
              Previous club: <span className="text-white/86">{player.previousClub}</span>
            </p>
          </div>
        </div>
      </article>
    </button>
  );
};
