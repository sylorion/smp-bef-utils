// listing-filter.ts

export interface FilterInput {
  field?: string | null;
  operator?: string | null;
  value?: string | null;
  type?: string | null;
}

  /**
   * Translates an array of FilterInput into a Prisma where object.
   */
export function buildWhereClause(filters?: FilterInput[]): Record<string, any> {
  if (!filters || filters.length === 0) {
    return {};
  }

  const where: Record<string, any> = {};

  // We'll accumulate multiple conditions in a single where object
  for (const f of filters) {
    // Skip any incomplete filter
    if (!f.field || !f.operator || f.value == null) continue;
    // We rely on a helper to build the sub-condition
    where[f.field] = getFilterCondition(f);
  }

  return where;
}

  /**
   * Builds a Prisma condition object for a single filter.
   * You can expand or adjust this to support more operators or data types.
   */
export function getFilterCondition(filter: FilterInput): any {
  const { operator, value, type } = filter;
  if (!operator || !value ) return {};
  // parseValueByType attempts to convert the raw string into number/boolean/etc. if needed
  const parsedValue = parseValueByType(value, type);
// Switch by the operator to construct the matching condition
  switch (operator) {
    case 'eq': return { equals: parsedValue };
    case 'neq': return { not: parsedValue };
    case 'in': return { in: parseArray(value, type) };
    case 'nin': return { notIn: parseArray(value, type) };
    case 'lt': return { lt: parsedValue };
    case 'lte': return { lte: parsedValue };
    case 'gt': return { gt: parsedValue };
    case 'gte': return { gte: parsedValue };
    case 'contains': return { contains: parsedValue };
    case 'startsWith': return { startsWith: parsedValue };
    case 'endsWith': return { endsWith: parsedValue };
    default: return { equals: parsedValue };
  }
}

  /**
   * Converts a single value into number, date, boolean, etc. based on 'type'.
   */
export function parseValueByType(value: string, type?: string | null ): any {
  switch (type) {
    case 'number': return Number(value);
    case 'boolean': return value === 'true';
    case 'date': return new Date(value);
    default: return value;
  }
}

  /**
   * Converts a comma-separated string (e.g. '1,2,3') into an array of typed values.
   */
export function parseArray(value: string, type?: string | null): any[] {
  return value.split(',').map((v) => parseValueByType(v.trim(), type));
}
