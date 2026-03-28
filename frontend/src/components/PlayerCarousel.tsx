import type { KeyboardEvent, TouchEvent } from 'react';
import { useState } from 'react';

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

const SWIPE_THRESHOLD = 48;

export const PlayerCarousel = ({
  players,
  activeIndex,
  onPrevious,
  onNext,
  onSelect,
}: PlayerCarouselProps) => {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const visibleRange = players.length <= 1 ? 0 : players.length === 2 ? 1 : 2;

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onPrevious();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      onNext();
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const distance = touchEndX - touchStartX;
    setTouchStartX(null);

    if (Math.abs(distance) < SWIPE_THRESHOLD) {
      return;
    }

    if (distance > 0) {
      onPrevious();
      return;
    }

    onNext();
  };

  return (
    <section
      className="glass-panel relative overflow-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-7"
      role="region"
      aria-label="Manchester United squad carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(218,41,28,0.16),_transparent_58%)]" />
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/80 to-transparent sm:w-24" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/80 to-transparent sm:w-24" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-label">Featured reds</p>
            <h2 className="font-display text-3xl leading-none text-white sm:text-4xl lg:text-5xl">
              Player spotlight
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/66">
              Move through the current shortlist and pull any player into focus with a tap or swipe.
            </p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
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

        <div
          className="relative mt-6 h-[22rem] overflow-hidden sm:h-[27rem] lg:h-[30rem]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="absolute left-2 top-1/2 z-20 -translate-y-1/2 md:hidden">
            <ArrowButton
              direction="left"
              onClick={onPrevious}
              disabled={players.length <= 1}
            />
          </div>
          <div className="absolute right-2 top-1/2 z-20 -translate-y-1/2 md:hidden">
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
            const scale = offset === 0 ? 1 : distance === 1 ? 0.82 : 0.64;
            const opacity = offset === 0 ? 1 : distance === 1 ? 0.72 : 0.28;
            const blur = distance === 2 ? 4 : distance === 1 ? 1 : 0;
            const translateX = offset * 78;

            return (
              <div
                key={player.id}
                className="card-transition absolute left-1/2 top-1/2 w-[13rem] sm:w-[16rem] lg:w-[18.75rem]"
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

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm leading-6 text-white/58">
            Swipe on mobile, tap the arrows, or use your keyboard to move the spotlight.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {players.map((player, index) => (
              <button
                key={player.id}
                type="button"
                aria-label={`Go to ${player.name}`}
                onClick={() => onSelect(index)}
                className={`rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                  index === activeIndex
                    ? 'h-2.5 w-10 bg-brand-gold shadow-[0_0_18px_rgba(246,196,83,0.7)]'
                    : 'h-2.5 w-2.5 bg-white/28 hover:bg-white/55'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
