/** Resolve the supported native Nuxt layout metadata without inferring a route surface. */
export function pageLayoutName(value: unknown): string | false | undefined {
  if (value === false) return false
  if (typeof value === 'string') return value || undefined
  if (value && typeof value === 'object' && 'name' in value)
    return pageLayoutName(value.name)
  return undefined
}
