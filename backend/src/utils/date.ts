export const isValidDateString = (value: string): boolean => !Number.isNaN(Date.parse(value));

export const toStartOfDay = (value: string): Date => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const toEndOfDay = (value: string): Date => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

export const getCurrentFootballSeasonYear = (referenceDate: Date = new Date()): number => {
  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.getUTCMonth() + 1;
  return month >= 7 ? year : year - 1;
};

export const getRecentSeasonYears = (referenceDate: Date = new Date()): number[] => {
  const currentSeason = getCurrentFootballSeasonYear(referenceDate);
  return [currentSeason, currentSeason - 1];
};
