/**
 * seededRng.js — Tiny deterministic PRNG based on mulberry32.
 *
 * Usage:
 *   const rng = mulberry32(seed);
 *   rng() → float in [0, 1)
 *
 * Reference: https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
 *
 * AC-P1D-D16
 */

/**
 * mulberry32 PRNG.
 *
 * @param {number} seed - Integer seed.
 * @returns {() => number} A function returning floats in [0, 1).
 */
export function mulberry32(seed) {
  let s = seed >>> 0; // coerce to uint32
  return function () {
    s |= 0;
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
