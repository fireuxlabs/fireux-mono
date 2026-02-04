import { useRuntimeConfig } from '#imports'
import {
    defaultFireuxJobsConfig,
    type FireuxJobsConfig,
} from '../../../config/jobs.config'

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : String(entry ?? '').trim()))
    .filter(Boolean)
}

export function useFireuxJobsConfig(): Readonly<FireuxJobsConfig> {
  const pub = (useRuntimeConfig().public ?? {}) as Record<string, any>
  const fireux = (pub.fireux ?? {}) as Record<string, any>
  const raw = (fireux.jobs ?? {}) as Record<string, any>

  const workplaces = toStringArray(raw.workplaces)

  const config: FireuxJobsConfig = {
    ...defaultFireuxJobsConfig,
    workplaces: workplaces.length ? workplaces : defaultFireuxJobsConfig.workplaces,
  }

  return Object.freeze(config)
}
