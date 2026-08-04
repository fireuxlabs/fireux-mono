import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configurePlaces } from './config/module/places-config'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { registerComposablesDir } from 'fireux-core/config/module/module-helpers'
import type {
  FireuxSeoExtendContext,
  FireuxSeoSitemapsExtendContext,
} from 'fireux-core/config/app/seo'
import { configureComponents } from './config/module/components-config'
import { configurePages } from './config/module/pages-config'
import { configureServer } from './config/module/server-config'

export interface ModuleOptions {
  debug?: boolean
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
    debug: false,
    prefix: 'Fire',
    types: [],
    googleAutocompleteTypeFilters: {},
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    nuxt.hook('fireux:seo:extend' as any, (ctx: FireuxSeoExtendContext) => {
      ctx.addHub('/places')
      ctx.addStaticPath('/places/learn-more')
    })
    nuxt.hook(
      'fireux:seo:sitemaps:extend' as any,
      (ctx: FireuxSeoSitemapsExtendContext) => {
        ctx.addEntity({
          entityKey: 'places',
          canonicalCollectionPath: 'places',
          routePrefix: '/places',
          routeIdentity: 'document-id',
          publicField: 'verified',
          publicValue: true,
        })
      }
    )

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) =>
        configurePlaces(nuxt, {
          debug: Boolean(options.debug),
          types: options.types || [],
          googleAutocompleteTypeFilters:
            options.googleAutocompleteTypeFilters || {},
        }),
      composables: registerComposablesDir,
      components: configureComponents,
      pages: configurePages,
      server: configureServer,
    })
  },
})
