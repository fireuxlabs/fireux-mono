export const humanizeDebugKey = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase())

const colorPattern =
  /^(?:#[\da-f]{3,8}|(?:rgb|hsl|hwb|lab|lch|oklab|oklch)a?\([^)]*\)|var\(--[^)]+\))$/i

export const isDebugColor = (value: unknown): value is string =>
  typeof value === 'string' && colorPattern.test(value.trim())

export const isDebugUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
