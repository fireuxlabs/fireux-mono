export const canonicalPlaceId = (id?: string | null): string | null =>
  (id ?? '')
    .trim()
    .replace(/^"+/, '')
    .replace(/"+$/, '')
    .replace(/^places\//, '') || null
