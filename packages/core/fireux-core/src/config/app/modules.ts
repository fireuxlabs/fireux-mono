import type { NuxtConfig } from '@nuxt/schema'

export const DEFAULT_APP_MODULES = ['fireux-blogs', 'fireux-products'] as const
export const DEFAULT_APP_LAYERS = [
  'fireux-blogs/layer',
  'fireux-products/layer',
] as const

export function withDefaultAppLayers<TLayer>(
  layers: readonly TLayer[]
): Array<TLayer | (typeof DEFAULT_APP_LAYERS)[number]> {
  const appLayers = [...layers]
  const appLayerNames = new Set<string>()
  for (const layer of appLayers) {
    if (typeof layer === 'string') appLayerNames.add(layer)
  }
  const defaults = DEFAULT_APP_LAYERS.filter(
    (name) => !appLayerNames.has(name)
  )

  return [...appLayers, ...defaults]
}

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
