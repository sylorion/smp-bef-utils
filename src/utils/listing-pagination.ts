// listing-pagination.ts

export interface PaginationInput {
  page?: number;
  pageSize?: number;
}

  /**
   * Dynamically structure pagination format for transaction queries.
   */
export function buildPagination(pagination?: PaginationInput): { skip: number; take: number } {
  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? 10;

  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (pageSize < 1) {
    throw new Error('Page size must be greater than 0');
  }

  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}
