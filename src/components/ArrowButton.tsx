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
      className="pointer-events-auto group inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/[0.55] text-white shadow-glow backdrop-blur-md transition duration-300 hover:border-brand-gold/40 hover:bg-brand-red/25 hover:text-brand-gold disabled:cursor-not-allowed disabled:opacity-40 sm:h-14 sm:w-14"
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
