import type { NuxtConfig } from '@nuxt/schema'

export const DEFAULT_APP_MODULES = ['fireux-blogs'] as const

export function moduleName(entry: unknown): string | undefined {
  if (typeof entry === 'string') return entry
  if (Array.isArray(entry) && typeof entry[0] === 'string') return entry[0]
  return undefined
}

export function withDefaultAppModules(
  modules: NonNullable<NuxtConfig['modules']> | undefined
): NonNullable<NuxtConfig['modules']> {
  const appModules = modules || []
  const appModuleNames = new Set(appModules.map(moduleName).filter(Boolean))
  const defaults = DEFAULT_APP_MODULES.filter(
    (name) => !appModuleNames.has(name)
  )

  return [...defaults, ...appModules] as NonNullable<NuxtConfig['modules']>
}
