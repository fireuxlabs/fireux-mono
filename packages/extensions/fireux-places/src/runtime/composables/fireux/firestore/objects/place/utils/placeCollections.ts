export function normalizePlaceType(raw: unknown): string | null {
  if (raw == null) return null
  if (Array.isArray(raw)) return normalizePlaceType(raw[0])
  const value = String(raw).trim()
  return value ? value : null
}
