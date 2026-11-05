import type { NuxtConfig } from '@nuxt/schema'
import { moduleName } from 'fireux-core/config/app/modules'

export const DEFAULT_APP_MODULES = ['fireux-blogs', 'fireux-products'] as const
export const DEFAULT_APP_LAYERS = [
  'fireux-core/layer',
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
  const defaults = DEFAULT_APP_LAYERS.filter((name) => !appLayerNames.has(name))

  return [...new Set([...appLayers, ...defaults])]
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
