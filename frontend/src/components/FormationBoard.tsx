import { getFormationSlots, laneOrder } from '../data/formation';
import type { Player } from '../types/player';

interface FormationBoardProps {
  players: Player[];
  activePlayerId?: number;
}

const laneClassMap: Record<(typeof laneOrder)[number], string> = {
  striker: 'grid-cols-1 max-w-[10rem]',
  'attacking-midfield': 'grid-cols-3',
  'double-pivot': 'grid-cols-2 max-w-[24rem]',
  defense: 'grid-cols-4',
  goalkeeper: 'grid-cols-1 max-w-[10rem]',
};

export const FormationBoard = ({
  players,
  activePlayerId,
}: FormationBoardProps) => {
  const slots = getFormationSlots(players);
  const activePlayer = players.find((player) => player.id === activePlayerId);

  return (
    <section className="glass-panel relative overflow-hidden p-5 sm:p-7">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(246,196,83,0.14),_transparent_26%),radial-gradient(circle_at_bottom,_rgba(218,41,28,0.2),_transparent_38%)]" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-label">Predicted shape</p>
            <h2 className="font-display text-3xl leading-none text-white sm:text-4xl lg:text-5xl">
              Projected XI
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68">
              A quick look at how the current group could line up in a 4-2-3-1. Pick a player above to see where he
              fits in the shape.
            </p>
          </div>

          <div className="panel-block min-w-[10rem] text-right">
            <p className="panel-label">Shape</p>
            <p className="mt-2 font-display text-4xl leading-none text-brand-gold">
              4-2-3-1
            </p>
            <p className="mt-2 text-sm text-white/56">
              {activePlayer ? `${activePlayer.name} highlighted` : 'Projected first-choice view'}
            </p>
          </div>
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-white/45 sm:hidden">
          Scroll sideways for the full pitch view.
        </p>

        <div className="-mx-2 mt-6 overflow-x-auto px-2 pb-2 sm:mx-0 sm:px-0">
          <div className="relative min-w-[34rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,71,42,0.92),rgba(7,42,24,0.96))] p-4 shadow-card sm:min-w-[42rem] sm:p-7">
            <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
            <div className="absolute inset-4 rounded-[1.6rem] border border-white/20 sm:inset-6" />
            <div className="absolute bottom-6 left-1/2 top-6 w-px -translate-x-1/2 bg-white/15" />
            <div className="absolute left-6 right-6 top-1/2 h-px -translate-y-1/2 bg-white/15" />
            <div className="absolute left-1/2 top-[14%] h-20 w-32 -translate-x-1/2 rounded-b-[999px] border-x border-b border-white/20" />
            <div className="absolute left-1/2 bottom-[14%] h-20 w-32 -translate-x-1/2 rounded-t-[999px] border-x border-t border-white/20" />
            <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

            <div className="relative flex min-h-[30rem] flex-col justify-between gap-5 sm:min-h-[34rem] sm:gap-6">
              {laneOrder.map((lane) => {
                const laneSlots = slots.filter((slot) => slot.lane === lane);

                return (
                  <div
                    key={lane}
                    className={`mx-auto grid w-full gap-3 sm:gap-4 ${laneClassMap[lane]}`}
                  >
                    {laneSlots.map((slot) => (
                      <article
                        key={`${slot.role}-${slot.playerName}`}
                        className={`rounded-[1.3rem] border p-2.5 text-center shadow-glow backdrop-blur-md transition duration-300 sm:p-4 ${
                          slot.playerId === activePlayerId
                            ? 'border-brand-gold/40 bg-brand-red/24'
                            : 'border-white/15 bg-black/38'
                        }`}
                      >
                        <span className="badge-accent inline-flex">
                          {slot.positionCode}
                        </span>
                        <p className="mt-3 font-display text-[1.05rem] leading-tight text-white sm:text-[1.35rem] lg:text-[1.9rem]">
                          {slot.playerName}
                        </p>
                        <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/56">
                          {slot.role}
                        </p>
                      </article>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
