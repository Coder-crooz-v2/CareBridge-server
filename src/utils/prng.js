/**
 * Seeded Pseudo-Random Number Generator utilities
 * Uses mulberry32 algorithm for deterministic random values
 */

/**
 * Create a seeded PRNG (mulberry32)
 * @param {number} seed - Numeric seed value
 * @returns {Function} Random number generator function (returns 0-1)
 */
export function createSeededRng(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert string (userId or socket.id) to numeric seed using FNV-1a hash
 * @param {string} str - String to convert to seed
 * @returns {number} Numeric seed
 */
export function seedFromString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Apply small random walk to keep values realistic and bounded
 * @param {number} value - Current value
 * @param {Function} rng - Random number generator
 * @param {number} step - Maximum step size (±step)
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Next value after random walk
 */
export function randomWalk(value, rng, step, min, max) {
  const delta = (rng() - 0.5) * step * 2; // ±step
  const next = value + delta;
  return Math.max(min, Math.min(max, next));
}
