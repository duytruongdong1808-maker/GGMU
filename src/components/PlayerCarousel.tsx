import type { Player } from '../types/player';
import { getVisualOffset } from '../utils/carousel';
import { ArrowButton } from './ArrowButton';
import { PlayerCard } from './PlayerCard';

interface PlayerCarouselProps {
  players: Player[];
  activeIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}

export const PlayerCarousel = ({
  players,
  activeIndex,
  onPrevious,
  onNext,
  onSelect,
}: PlayerCarouselProps) => {
  const visibleRange = players.length <= 1 ? 0 : players.length === 2 ? 1 : 2;

  return (
    <section className="glass-panel relative overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(218,41,28,0.16),_transparent_58%)]" />
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/80 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/80 to-transparent" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-label">Horizontal Carousel</p>
            <h2 className="font-display text-4xl leading-none text-white sm:text-5xl">
              First-Team Rotation
            </h2>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <ArrowButton
              direction="left"
              onClick={onPrevious}
              disabled={players.length <= 1}
            />
            <ArrowButton
              direction="right"
              onClick={onNext}
              disabled={players.length <= 1}
            />
          </div>
        </div>

        <div className="relative mt-8 h-[24rem] overflow-hidden sm:h-[28rem] lg:h-[31rem]">
          <div className="pointer-events-none absolute left-2 top-1/2 z-20 -translate-y-1/2 md:hidden">
            <ArrowButton
              direction="left"
              onClick={onPrevious}
              disabled={players.length <= 1}
            />
          </div>
          <div className="pointer-events-none absolute right-2 top-1/2 z-20 -translate-y-1/2 md:hidden">
            <ArrowButton
              direction="right"
              onClick={onNext}
              disabled={players.length <= 1}
            />
          </div>

          {players.map((player, index) => {
            const offset = getVisualOffset(index, activeIndex, players.length);

            if (Math.abs(offset) > visibleRange) {
              return null;
            }

            const distance = Math.abs(offset);
            const scale = offset === 0 ? 1 : distance === 1 ? 0.84 : 0.68;
            const opacity = offset === 0 ? 1 : distance === 1 ? 0.72 : 0.38;
            const blur = distance === 2 ? 3 : distance === 1 ? 0.8 : 0;
            const translateX = offset * 84;

            return (
              <div
                key={player.id}
                className="card-transition absolute left-1/2 top-1/2 w-[15rem] sm:w-[17rem] lg:w-[19rem]"
                style={{
                  transform: `translate(-50%, -50%) translateX(${translateX}%) scale(${scale})`,
                  opacity,
                  zIndex: 100 - distance,
                  filter: `blur(${blur}px)`,
                }}
              >
                <PlayerCard
                  player={player}
                  isActive={offset === 0}
                  offset={offset}
                  onClick={() => onSelect(index)}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-white/[0.55]">
            Use arrows or keyboard left/right to shift the spotlight.
          </p>
          <div className="flex items-center gap-2">
            {players.map((player, index) => (
              <button
                key={player.id}
                type="button"
                aria-label={`Go to ${player.name}`}
                onClick={() => onSelect(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'w-10 bg-brand-gold shadow-[0_0_18px_rgba(246,196,83,0.7)]'
                    : 'w-2.5 bg-white/30 hover:bg-white/[0.55]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
