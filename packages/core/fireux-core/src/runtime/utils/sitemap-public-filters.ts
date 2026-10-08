export type SitemapPublicFilter = {
  field: string
  value: boolean | string | number
}

/** Explicit equality conditions supplied by the owning domain. Invalid policy fails closed. */
export function readSitemapPublicFilters(
  value: unknown
): SitemapPublicFilter[] {
  if (value === undefined) return []
  if (!Array.isArray(value))
    throw new Error('Sitemap public filters must be an array.')
  const fields = new Set<string>()
  return value.map((entry) => {
    if (
      !entry ||
      typeof entry !== 'object' ||
      Array.isArray(entry) ||
      Object.keys(entry).some((key) => !['field', 'value'].includes(key)) ||
      typeof entry.field !== 'string' ||
      !/^[A-Za-z_][\w]*(?:\.[A-Za-z_][\w]*)*$/.test(entry.field) ||
      fields.has(entry.field) ||
      !(
        typeof entry.value === 'boolean' ||
        typeof entry.value === 'string' ||
        (typeof entry.value === 'number' && Number.isFinite(entry.value))
      )
    ) {
      throw new Error('Sitemap public filter is invalid.')
    }
    fields.add(entry.field)
    return { field: entry.field, value: entry.value }
  })
}

export function matchesSitemapPublicFilters(
  data: Record<string, unknown>,
  filters: SitemapPublicFilter[]
): boolean {
  return filters.every(
    (filter) =>
      filter.field
        .split('.')
        .reduce<unknown>(
          (value, key) =>
            value && typeof value === 'object' && !Array.isArray(value)
              ? (value as Record<string, unknown>)[key]
              : undefined,
          data
        ) === filter.value
  )
}
