import { dedupeKeepLast, type ModuleEntry } from './module-utils'
import type { TenantIntegrations } from './tenant-integrations'

export function resolveTenantModules(
  includeCore: boolean,
  extraModules: ModuleEntry[] | undefined,
  integrations: TenantIntegrations
): ModuleEntry[] {
  const base: ModuleEntry[] = [
    '@nuxt/ui',
    '@nuxt/icon',
    ['nuxt-vuefire', integrations.vuefireConfig],
    ['@vite-pwa/nuxt', integrations.pwaConfig],
    ...(includeCore ? (['fireux-core'] as ModuleEntry[]) : []),
  ]

  return dedupeKeepLast([...base, ...(extraModules ?? [])])
}
