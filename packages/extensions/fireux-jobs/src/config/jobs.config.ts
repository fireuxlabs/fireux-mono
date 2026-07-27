// Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: add category and workplace configuration.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: make canonical Place identity universal across Apps.
// Concurrent edit — 2026-07-22 12:56 CEST — Job category scope: model explicit all-category Apps without inventing an all category id.
export type FireuxJobCategoryScope = 'all' | 'allowlist'

export type FireuxJobCategorySelection = 'all' | string[]

export type FireuxJobSourceAppDoorway = {
  label: string
  url: string
}

export type FireuxJobSourceAppDoorways = Record<
  string,
  FireuxJobSourceAppDoorway
>

export type FireuxJobsConfig = {
  /** Whether the App accepts every valid product-neutral category identifier. */
  categoryScope: FireuxJobCategoryScope
  /** Allowed product-neutral category identifiers for new jobs. */
  categories: string[]
  /**
   * Trusted public handoffs for Jobs authored by another App in the same
   * ecosystem. Keys remain server-side; public DTOs receive only label + URL.
   */
  sourceAppDoorways: FireuxJobSourceAppDoorways
}

export const defaultFireuxJobsConfig: FireuxJobsConfig = {
  categoryScope: 'allowlist',
  categories: [],
  sourceAppDoorways: {},
}

const doorwayId = (value: unknown) => {
  const id = String(value ?? '').trim()
  return id && id.length <= 1_500 && !id.includes('/') ? id : ''
}

const doorwayLabel = (value: unknown) => {
  const label = String(value ?? '').trim()
  return label && label.length <= 120 ? label : ''
}

const doorwayUrl = (value: unknown) => {
  const raw = String(value ?? '').trim()
  if (!raw || raw.length > 2_000) return ''
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:' || url.username || url.password) return ''
    url.hash = ''
    url.search = ''
    url.pathname = url.pathname.replace(/\/+$/, '')
    return url.toString().replace(/\/$/, '')
  } catch {
    return ''
  }
}

export function normalizeFireuxJobSourceAppDoorways(
  value: unknown
): FireuxJobSourceAppDoorways {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const normalized: FireuxJobSourceAppDoorways = {}
  for (const [rawId, rawDoorway] of Object.entries(value)) {
    if (
      !rawDoorway ||
      typeof rawDoorway !== 'object' ||
      Array.isArray(rawDoorway)
    ) continue
    const id = doorwayId(rawId)
    const source = rawDoorway as Record<string, unknown>
    const label = doorwayLabel(source.label)
    const url = doorwayUrl(source.url)
    if (id && label && url) normalized[id] = { label, url }
  }
  return normalized
}
