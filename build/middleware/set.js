// src/middleware/set.ts
export function set(obj, path, value) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    if (typeof path === 'string') {
        path = path.match(/[^.[\]]+/g) || [];
    }
    if (!Array.isArray(path)) {
        throw new Error('Path must be a string or an array');
    }
    const lastKey = path.pop();
    let current = obj;
    for (let i = 0; i < path.length; i++) {
        const key = path[i];
        if (typeof current[key] !== 'object' || current[key] === null) {
            current[key] = Math.abs(Number(path[i + 1])) >> 0 === +path[i + 1] ? [] : {};
        }
        current = current[key];
    }
    current[lastKey] = value;
    return obj;
}
