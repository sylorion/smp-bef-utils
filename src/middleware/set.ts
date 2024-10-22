// src/middleware/set.ts
export function set<T extends Record<string, any>>(obj: T, path: string | string[], value: unknown): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (typeof path === 'string') {
    path = path.match(/[^.[\]]+/g) || [];
  }

  if (!Array.isArray(path)) {
    throw new Error('Path must be a string or an array');
  }

  const lastKey = path.pop() as string;

  let current = obj;
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    if (typeof current[key] !== 'object' || current[key] === null) {
      (current as any)[key] = Math.abs(Number(path[i + 1])) >> 0 === +path[i + 1] ? [] : {};
    }
    current = current[key];
  }

  (current as any)[lastKey] = value;
  return obj;
}
