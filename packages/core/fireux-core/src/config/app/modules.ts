export function moduleName(entry: unknown): string | undefined {
  if (typeof entry === 'string') return entry
  if (Array.isArray(entry) && typeof entry[0] === 'string') return entry[0]
  return undefined
}
