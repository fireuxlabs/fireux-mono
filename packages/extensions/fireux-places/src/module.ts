import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureComponents } from './config/module/components-config'
import { configureComposables } from './config/module/composables-config'
import { configureLayouts } from './config/module/layouts-config'
import { configureModels } from './config/module/models-config'
import { configurePages } from './config/module/pages-config'
import { configurePlaces } from './config/module/places-config'
import { configurePlugins } from './config/module/plugins-config'
import { configureServer } from './config/module/server-config'
import { exposeRuntimeAlias } from 'fireux-core/config/module/runtime-layer'

export interface ModuleOptions {
  prefix?: string
  types?: string[]
  /** Optional filter map for Google Autocomplete prediction types by context type.
   *  Example: { kitchen: ['restaurant','cafe','food_truck'] }
   */
  googleAutocompleteTypeFilters?: Record<string, string[]>
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fireuxPlaces?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    fireuxPlaces?: Partial<ModuleOptions>
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-places',
    version: '0.1.0',
    configKey: 'fireuxPlaces',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: {
    prefix: 'Fire',
    types: [],
    googleAutocompleteTypeFilters: {},
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const runtimeDir = resolver.resolve('./runtime')

    configurePlaces(nuxt, {
      types: options.types || [],
      googleAutocompleteTypeFilters: options.googleAutocompleteTypeFilters || {},
    })
    configurePlugins(resolver)
    configureComposables(resolver, options)
    configureComponents(resolver)
    configureLayouts(resolver, nuxt)
    configureModels(resolver)
    configurePages(resolver, nuxt)
    configureServer(resolver)

    exposeRuntimeAlias(nuxt, '#fireux-places', runtimeDir)
  },
})
