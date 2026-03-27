import { carrickStyle4231 } from '../data/formation';

const laneOrder = [
  'striker',
  'attacking-midfield',
  'double-pivot',
  'defense',
  'goalkeeper',
] as const;

const laneClassMap: Record<(typeof laneOrder)[number], string> = {
  striker: 'grid-cols-1 max-w-[10rem]',
  'attacking-midfield': 'grid-cols-3',
  'double-pivot': 'grid-cols-2 max-w-[24rem]',
  defense: 'grid-cols-4',
  goalkeeper: 'grid-cols-1 max-w-[10rem]',
};

export const FormationBoard = () => {
  return (
    <section className="glass-panel relative overflow-hidden p-6 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(246,196,83,0.14),_transparent_26%),radial-gradient(circle_at_bottom,_rgba(218,41,28,0.2),_transparent_38%)]" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-label">Tactical Board</p>
            <h2 className="font-display text-4xl leading-none text-white sm:text-5xl">
              4-2-3-1 Shape
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              A Carrick-inspired 4-2-3-1 reference board, adapted here with the current squad so the role map stays
              aligned with the player carousel.
            </p>
          </div>

          <div className="rounded-[1.35rem] border border-brand-gold/20 bg-black/[0.35] px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-white/[0.45]">
              System
            </p>
            <p className="mt-2 font-display text-4xl leading-none text-brand-gold">
              4-2-3-1
            </p>
          </div>
        </div>

        <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,71,42,0.92),rgba(7,42,24,0.96))] p-5 shadow-card sm:p-7">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="absolute inset-4 rounded-[1.6rem] border border-white/20 sm:inset-6" />
          <div className="absolute left-1/2 top-6 bottom-6 w-px -translate-x-1/2 bg-white/[0.15]" />
          <div className="absolute left-6 right-6 top-1/2 h-px -translate-y-1/2 bg-white/[0.15]" />
          <div className="absolute left-1/2 top-[14%] h-20 w-32 -translate-x-1/2 rounded-b-[999px] border-x border-b border-white/20" />
          <div className="absolute left-1/2 bottom-[14%] h-20 w-32 -translate-x-1/2 rounded-t-[999px] border-x border-t border-white/20" />
          <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

          <div className="relative flex min-h-[40rem] flex-col justify-between gap-6">
            {laneOrder.map((lane) => {
              const slots = carrickStyle4231.filter((slot) => slot.lane === lane);

              return (
                <div
                  key={lane}
                  className={`mx-auto grid w-full gap-3 sm:gap-4 ${laneClassMap[lane]}`}
                >
                  {slots.map((slot) => (
                    <article
                      key={`${slot.role}-${slot.playerName}`}
                      className="rounded-[1.4rem] border border-white/[0.15] bg-black/[0.38] p-3 text-center shadow-glow backdrop-blur-md sm:p-4"
                    >
                      <span className="inline-flex min-w-[3.2rem] items-center justify-center rounded-full border border-brand-gold/30 bg-brand-red/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-brand-gold">
                        {slot.positionCode}
                      </span>
                      <p className="mt-3 font-display text-3xl leading-none text-white">
                        {slot.playerName}
                      </p>
                      <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/[0.5]">
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
    </section>
  );
};
