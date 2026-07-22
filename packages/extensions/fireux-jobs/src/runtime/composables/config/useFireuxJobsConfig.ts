// Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: read category and workplace configuration.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: expose category as the only App-configured Job delta.
// Concurrent edit — 2026-07-22 12:56 CEST — Job category scope: expose explicit all-category runtime configuration.
import { useRuntimeConfig } from '#imports'
import {
  defaultFireuxJobsConfig,
  type FireuxJobsConfig,
} from '../../../config/jobs.config'

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return Array.from(
    new Set(
      value
        .map((entry) =>
          typeof entry === 'string' ? entry.trim() : String(entry ?? '').trim()
        )
        .filter(Boolean)
    )
  )
}

export function useFireuxJobsConfig(): Readonly<FireuxJobsConfig> {
  const pub = (useRuntimeConfig().public ?? {}) as Record<string, any>
  const fireux = (pub.fireux ?? {}) as Record<string, any>
  const raw = (fireux.jobs ?? {}) as Record<string, any>

  const categoryScope = raw.categoryScope === 'all' ? 'all' : 'allowlist'
  const categories = toStringArray(raw.categories)

  const config: FireuxJobsConfig = {
    ...defaultFireuxJobsConfig,
    categoryScope,
    categories,
  }

  return Object.freeze(config)
}
