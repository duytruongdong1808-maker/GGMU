export const wrapIndex = (index: number, total: number) => {
  if (total === 0) {
    return 0;
  }

  return (index + total) % total;
};

export const getVisualOffset = (
  itemIndex: number,
  activeIndex: number,
  total: number,
) => {
  if (total <= 1) {
    return 0;
  }

  const rawOffset = itemIndex - activeIndex;
  const half = Math.floor(total / 2);

  if (rawOffset > half) {
    return rawOffset - total;
  }

  if (rawOffset < -half) {
    return rawOffset + total;
  }

  return rawOffset;
};
