export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export const normalizePagination = (pagination: PaginationInput): Required<PaginationInput> => {
  const page = pagination.page && pagination.page > 0 ? pagination.page : DEFAULT_PAGE;
  const limit =
    pagination.limit && pagination.limit > 0
      ? Math.min(pagination.limit, MAX_LIMIT)
      : DEFAULT_LIMIT;

  return { page, limit };
};

export const getPaginationSkip = ({ page, limit }: Required<PaginationInput>): number =>
  (page - 1) * limit;

export const buildPaginationMeta = (
  pagination: Required<PaginationInput>,
  total: number,
): PaginationMeta => ({
  page: pagination.page,
  limit: pagination.limit,
  total,
  totalPages: total === 0 ? 0 : Math.ceil(total / pagination.limit),
});
