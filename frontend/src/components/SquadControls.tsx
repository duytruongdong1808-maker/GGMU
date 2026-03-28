interface SquadControlsProps {
  searchQuery: string;
  positionFilter: string;
  nationalityFilter: string;
  sortBy: string;
  visibleCount: number;
  totalCount: number;
  positions: string[];
  nationalities: string[];
  onSearchChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  onNationalityChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
}

const sortOptions = [
  { value: 'spotlight', label: 'Spotlight order' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'youngest', label: 'Youngest first' },
  { value: 'oldest', label: 'Oldest first' },
];

export const SquadControls = ({
  searchQuery,
  positionFilter,
  nationalityFilter,
  sortBy,
  visibleCount,
  totalCount,
  positions,
  nationalities,
  onSearchChange,
  onPositionChange,
  onNationalityChange,
  onSortChange,
  onClearFilters,
}: SquadControlsProps) => {
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    positionFilter !== 'all' ||
    nationalityFilter !== 'all' ||
    sortBy !== 'spotlight';

  return (
    <section className="glass-panel relative overflow-hidden p-4 sm:p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,_rgba(218,41,28,0.14),_transparent_30%),radial-gradient(circle_at_right,_rgba(246,196,83,0.08),_transparent_24%)]" />
      <div className="relative space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="section-label">Squad hub</p>
            <h2 className="mt-2 font-display text-3xl leading-none text-white sm:text-4xl">
              Find players faster
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68">
              Narrow the squad by role, nationality, or profile so it is easy to move from a broad view to the exact
              player you want.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-white/58">
            <span className="stat-chip !px-3 !py-1.5 !text-[0.68rem]">
              {visibleCount} of {totalCount} players visible
            </span>
            {hasActiveFilters ? (
              <button type="button" onClick={onClearFilters} className="button-secondary">
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.7fr))]">
          <label className="input-shell">
            <span className="panel-label">Search player</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by player, role, country, or previous club"
              className="input-field"
            />
          </label>

          <label className="input-shell">
            <span className="panel-label">Position</span>
            <select
              value={positionFilter}
              onChange={(event) => onPositionChange(event.target.value)}
              className="input-field"
            >
              <option value="all">All groups</option>
              {positions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </label>

          <label className="input-shell">
            <span className="panel-label">Nationality</span>
            <select
              value={nationalityFilter}
              onChange={(event) => onNationalityChange(event.target.value)}
              className="input-field"
            >
              <option value="all">All countries</option>
              {nationalities.map((nationality) => (
                <option key={nationality} value={nationality}>
                  {nationality}
                </option>
              ))}
            </select>
          </label>

          <label className="input-shell">
            <span className="panel-label">Sort by</span>
            <select
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value)}
              className="input-field"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </section>
  );
};
