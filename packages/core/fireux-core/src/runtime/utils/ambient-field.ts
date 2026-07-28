const UINT32_MAX = 0xffffffff

/**
 * Returns a stable 0–1 value for decorative geometry.
 *
 * Ambient effects render during SSR, so their layout must not depend on
 * runtime randomness or change when the client hydrates.
 */
export function ambientUnit(index: number, salt: number, seed = 0): number {
  let value =
    Math.imul(index + seed + 1, 0x9e3779b1) ^
    Math.imul(salt + seed + 1, 0x85ebca6b)

  value ^= value >>> 16
  value = Math.imul(value, 0x7feb352d)
  value ^= value >>> 15
  value = Math.imul(value, 0x846ca68b)
  value ^= value >>> 16

  return (value >>> 0) / UINT32_MAX
}

export function ambientRange(
  index: number,
  salt: number,
  min: number,
  max: number,
  seed = 0
): number {
  return min + ambientUnit(index, salt, seed) * (max - min)
}
