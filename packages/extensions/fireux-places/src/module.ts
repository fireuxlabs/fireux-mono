import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configurePlaces } from './config/module/places-config'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { configurePlugins } from './config/module/plugins-config'
import { configureComposables } from './config/module/composables-config'
import { configureComponents } from './config/module/components-config'
import { configureLayouts } from './config/module/layouts-config'
import { configureModels } from './config/module/models-config'
import { configurePages } from './config/module/pages-config'
import { configureServer } from './config/module/server-config'

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

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) =>
        configurePlaces(nuxt, {
          types: options.types || [],
          googleAutocompleteTypeFilters:
            options.googleAutocompleteTypeFilters || {},
        }),
      plugins: configurePlugins,
      composables: (resolver) => configureComposables(resolver, options),
      components: configureComponents,
      layouts: configureLayouts,
      models: configureModels,
      pages: configurePages,
      server: configureServer,
    })
  },
})
