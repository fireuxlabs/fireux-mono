import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configurePlaces } from './config/module/places-config.ts'
import { registerComposablesDirs } from 'fireux-core/config/module/module-helpers'
import type {
  FireuxSeoExtendContext,
  FireuxSeoSitemapsExtendContext,
} from 'fireux-core/config/app/seo-config'
import { configureComponents } from './config/module/components-config.ts'
import { requireNativeRuntimeLayer } from 'fireux-core/config/module/runtime-layer'
import { configureServer } from './config/module/server-config.ts'

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

    configurePlaces(nuxt, {
      debug: Boolean(options.debug),
      types: options.types || [],
      googleAutocompleteTypeFilters:
        options.googleAutocompleteTypeFilters || {},
    })
    registerComposablesDirs(resolver, ['./runtime/place/composables'])
    configureComponents(resolver)
    requireNativeRuntimeLayer(resolver, nuxt)
    configureServer(resolver)
  },
})
