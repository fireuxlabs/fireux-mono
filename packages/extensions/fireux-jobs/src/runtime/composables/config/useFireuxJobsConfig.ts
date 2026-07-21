// Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: read category and workplace configuration.
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

  const categories = toStringArray(raw.categories)
  const workplaces = toStringArray(raw.workplaces)
  const defaultWorkplaceType = String(raw.defaultWorkplaceType ?? '').trim()

  const config: FireuxJobsConfig = {
    ...defaultFireuxJobsConfig,
    categories,
    workplaces,
    ...(defaultWorkplaceType ? { defaultWorkplaceType } : {}),
  }

  return Object.freeze(config)
}
