interface ArrowButtonProps {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled?: boolean;
}

export const ArrowButton = ({
  direction,
  onClick,
  disabled = false,
}: ArrowButtonProps) => {
  const label = direction === 'left' ? 'Previous player' : 'Next player';

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="pointer-events-auto group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/[0.55] text-white shadow-glow backdrop-blur-md transition duration-300 hover:border-brand-gold/[0.4] hover:bg-brand-red/[0.25] hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:w-12"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 transition duration-300 group-hover:scale-110 ${
          direction === 'left' ? '' : 'rotate-180'
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 5 8 12l7 7" />
      </svg>
    </button>
  );
};
