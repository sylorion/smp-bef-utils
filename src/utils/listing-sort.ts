// listing-sort.ts

export interface SortInput {
  field?: string | null;
  direction?: 'ASC' | 'DESC';
}

export function buildSort(sort?: SortInput): Record<string, any> | undefined {
  if (!sort || !sort.field) {
    return undefined;
  }

  return { [sort.field]: sort.direction === 'DESC' ? 'desc' : 'asc' };
}
