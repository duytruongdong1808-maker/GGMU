interface SquadSummaryBarProps {
  visibleCount: number;
  totalCount: number;
  averageAge: number;
  activePlayerName: string;
  activePlayerPosition: string;
  starterCount: number;
}

export const SquadSummaryBar = ({
  visibleCount,
  totalCount,
  averageAge,
  activePlayerName,
  activePlayerPosition,
  starterCount,
}: SquadSummaryBarProps) => {
  const items = [
    {
      label: 'Squad in view',
      value: `${visibleCount} players`,
      meta: `${totalCount} available overall`,
      tone: 'text-brand-gold',
    },
    {
      label: 'In focus',
      value: activePlayerName,
      meta: activePlayerPosition,
    },
    {
      label: 'Average age',
      value: Number.isFinite(averageAge) ? averageAge.toFixed(1) : '--',
      meta: 'Across this view',
      tone: 'text-white',
    },
    {
      label: 'Predicted XI',
      value: `${starterCount} starters`,
      meta: '4-2-3-1 shape',
    },
  ];

  return (
    <section className="glass-panel relative overflow-hidden px-4 py-4 sm:px-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(246,196,83,0.12),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(218,41,28,0.16),_transparent_34%)]" />
      <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <article key={item.label} className="panel-block min-h-[7rem]">
            <p className="panel-label">{item.label}</p>
            <p className={`mt-3 text-xl font-semibold leading-tight sm:text-2xl ${item.tone ?? 'text-white'}`}>
              {item.value}
            </p>
            {item.meta ? (
              <p className="mt-2 text-sm text-white/58">
                {item.meta}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
};
