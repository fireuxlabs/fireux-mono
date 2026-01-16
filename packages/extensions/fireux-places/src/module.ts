import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureLayouts } from './config/layouts-config'
import { configureModels } from './config/models-config'
import { configurePages } from './config/pages-config'
import { configurePlugins } from './config/plugins-config'
import { configureRuntime } from './config/runtime-config'
import { configureServer } from './config/server-config'

export interface ModuleOptions {
  prefix?: string
  types?: string[]
  /** Optional filter map for Google Autocomplete prediction types by context type.
   *  Example: { kitchen: ['restaurant','cafe','food_truck'] }
   */
  googleAutocompleteTypeFilters?: Record<string, string[]>
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-places',
    version: '0.1.0',
    configKey: 'fireuxPlaces',
  },
  defaults: {
    prefix: 'Fire',
    types: [],
    googleAutocompleteTypeFilters: {},
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    configureRuntime(nuxt, 'places', {
      enabled: true,
      types: options.types || [],
      googleAutocompleteTypeFilters: options.googleAutocompleteTypeFilters || {},
    })
    configurePlugins(resolver)
    configureComponents(resolver)
    configureComposables(resolver, options)
    configureLayouts(resolver, nuxt)
    configureModels(resolver)
    configurePages(resolver, nuxt)
    configureServer(resolver)
  },
})

export default module
