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
    <section className="glass-panel mx-auto max-w-3xl overflow-hidden p-7 text-center sm:p-9">
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
          <path d="M12 8v5" />
          <path d="M12 16h.01" />
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </svg>
      </div>

      <h2 className="mt-6 font-display text-4xl leading-none text-white sm:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/70">
        {description}
      </p>

      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="button-primary mt-8"
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
};
