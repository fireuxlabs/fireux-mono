export const normalizeString = (value: unknown): string =>
  String(value ?? '').trim()

export const uniqueStrings = (values: unknown): string[] => {
  if (!Array.isArray(values)) return []

  return Array.from(
    new Set(values.map((value) => normalizeString(value)).filter(Boolean))
  )
}
