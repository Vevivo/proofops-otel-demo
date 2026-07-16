import { sha256Hex } from './canonical.mjs';

function parent(left, right) {
  return sha256Hex(Buffer.concat([Buffer.from(left, 'hex'), Buffer.from(right, 'hex')]));
}

export function buildMerkle(leaves) {
  if (!leaves.length) throw new TypeError('At least one leaf is required');
  const levels = [leaves.slice()];
  while (levels.at(-1).length > 1) {
    const current = levels.at(-1);
    const next = [];
    for (let i = 0; i < current.length; i += 2) {
      next.push(parent(current[i], current[i + 1] ?? current[i]));
    }
    levels.push(next);
  }
  const paths = leaves.map((_, originalIndex) => {
    const path = [];
    let index = originalIndex;
    for (let level = 0; level < levels.length - 1; level += 1) {
      const row = levels[level];
      const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;
      const actualSibling = row[siblingIndex] ?? row[index];
      path.push({ position: index % 2 === 0 ? 'right' : 'left', hash: actualSibling });
      index = Math.floor(index / 2);
    }
    return path;
  });
  return { root: levels.at(-1)[0], paths };
}

export function verifyMerklePath(leaf, path, root) {
  let current = leaf;
  for (const step of path) {
    current = step.position === 'left' ? parent(step.hash, current) : parent(current, step.hash);
  }
  return current === root;
}
