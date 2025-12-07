import { dedupeKeepLast, type ModuleEntry } from './module-utils'
import type { TenantIntegrations } from './tenant-integrations'

export function resolveTenantModules(
  includeCore: boolean,
  moduleIds: string[] | undefined,
  integrations: TenantIntegrations
): ModuleEntry[] {
  const base: ModuleEntry[] = [
    '@nuxt/ui',
    '@nuxt/icon',
    ['nuxt-vuefire', integrations.vuefireConfig],
    ['@vite-pwa/nuxt', integrations.pwaConfig],
    ...(includeCore ? (['fireux-core'] as ModuleEntry[]) : []),
  ]

  const extras = sanitizeModuleIds(moduleIds)

  return dedupeKeepLast([...base, ...extras])
}

function sanitizeModuleIds(ids?: string[]): string[] {
  if (!ids?.length) return []
  return ids.map((id) => id?.trim()).filter((id): id is string => Boolean(id))
}
