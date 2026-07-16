import { createHash } from 'node:crypto';

export function canonicalize(value) {
  if (value === null) return 'null';
  if (typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Non-finite number');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => {
      if (value[key] === undefined) throw new TypeError(`Undefined value at ${key}`);
      return `${JSON.stringify(key)}:${canonicalize(value[key])}`;
    }).join(',')}}`;
  }
  throw new TypeError(`Unsupported type: ${typeof value}`);
}

export function sha256Hex(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function hashJson(value) {
  return sha256Hex(canonicalize(value));
}
