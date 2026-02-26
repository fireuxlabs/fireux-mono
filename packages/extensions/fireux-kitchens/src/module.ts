import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureRuntime } from './config/module/runtime-config'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { registerReservedRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import { configurePlugins } from './config/module/plugins-config'
import { configureComposables } from './config/module/composables-config'
import { configureComponents } from './config/module/components-config'
import { configureLayouts } from './config/module/layouts-config'
import { configureModels } from './config/module/models-config'
import { configurePages } from './config/module/pages-config'
import { configureServer } from './config/module/server-config'

export interface ModuleOptions {
  prefix?: string
  defaultKitchenId?: string
  ensureTestKitchen?: boolean
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fireuxKitchens?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    fireuxKitchens?: Partial<ModuleOptions>
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-kitchens',
    version: '0.1.0',
    configKey: 'fireuxKitchens',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: {
    prefix: 'Fire',
    defaultKitchenId: '',
    ensureTestKitchen: true,
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    registerReservedRouteKeys(['kitchens', 'chefs', 'ingredients'])

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) =>
        configureRuntime(nuxt, 'kitchens', {
          enabled: true,
          defaultKitchenId: String(options.defaultKitchenId || '').trim(),
          ensureTestKitchen: options.ensureTestKitchen !== false,
        }),
      plugins: configurePlugins,
      composables: configureComposables,
      components: configureComponents,
      layouts: configureLayouts,
      models: configureModels,
      pages: configurePages,
      server: configureServer,
    })
  },
})
