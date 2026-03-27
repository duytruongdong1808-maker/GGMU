interface StatusPanelProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const StatusPanel = ({
  title,
  description,
  actionLabel,
  onAction,
}: StatusPanelProps) => {
  return (
    <section className="glass-panel mx-auto max-w-3xl overflow-hidden p-8 text-center sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-brand-red/30 bg-brand-red/[0.12] text-brand-gold shadow-glow">
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M4 20h16" />
        </svg>
      </div>

      <h2 className="mt-6 font-display text-5xl leading-none text-white">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/70">
        {description}
      </p>

      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-8 rounded-full border border-brand-gold/20 bg-brand-red px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white transition duration-300 hover:bg-brand-dark hover:text-brand-gold"
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
};
