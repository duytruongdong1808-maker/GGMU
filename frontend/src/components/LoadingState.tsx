export const LoadingState = () => {
  return (
    <div className="space-y-6">
      <section className="glass-panel overflow-hidden p-5 sm:p-6">
        <div className="animate-pulse">
          <div className="grid gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 rounded-[1.3rem] border border-white/10 bg-white/5" />
            ))}
          </div>
        </div>
      </section>

      <section className="glass-panel overflow-hidden p-5 sm:p-6">
        <div className="animate-pulse">
          <div className="h-3 w-28 rounded-full bg-white/10" />
          <div className="mt-4 h-9 w-64 rounded-full bg-white/10" />
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 rounded-[1.3rem] border border-white/10 bg-white/5" />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <div className="glass-panel overflow-hidden p-5 sm:p-6">
          <div className="animate-pulse">
            <div className="h-3 w-28 rounded-full bg-white/10" />
            <div className="mt-4 h-10 w-72 rounded-full bg-white/10" />
            <div className="relative mt-8 h-[22rem] sm:h-[27rem] lg:h-[30rem]">
              <div className="absolute left-[16%] top-1/2 h-64 w-40 -translate-y-1/2 rounded-[1.7rem] border border-white/10 bg-white/5 blur-[1px]" />
              <div className="absolute left-1/2 top-1/2 h-80 w-52 -translate-x-1/2 -translate-y-1/2 rounded-[1.9rem] border border-brand-red/25 bg-brand-red/[0.15] shadow-glow" />
              <div className="absolute right-[16%] top-1/2 h-64 w-40 -translate-y-1/2 rounded-[1.7rem] border border-white/10 bg-white/5 blur-[1px]" />
            </div>
            <div className="mt-8 flex items-center justify-between gap-6">
              <div className="h-4 w-56 rounded-full bg-white/10" />
              <div className="flex gap-2">
                <div className="h-2.5 w-10 rounded-full bg-brand-gold/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 sm:p-6">
          <div className="animate-pulse">
            <div className="h-3 w-36 rounded-full bg-white/10" />
            <div className="mt-5 h-14 w-64 rounded-[1rem] bg-white/10" />
            <div className="mt-5 h-28 rounded-[1.5rem] bg-white/10" />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 rounded-[1.4rem] border border-white/10 bg-white/5"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
