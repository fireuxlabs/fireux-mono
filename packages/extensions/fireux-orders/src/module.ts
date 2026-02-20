import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { configurePlugins } from './config/module/plugins-config'
import { configureComposables } from './config/module/composables-config'
import { configureComponents } from './config/module/components-config'
import { configureLayouts } from './config/module/layouts-config'
import { configureModels } from './config/module/models-config'
import { configurePages } from './config/module/pages-config'
import { configureServer } from './config/module/server-config'
import { configureRuntime } from './config/module/runtime-config'

export interface ModuleOptions {
  enabled?: boolean
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fireuxOrders?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    fireuxOrders?: Partial<ModuleOptions>
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-orders',
    version: '0.1.0',
    configKey: 'fireuxOrders',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: {
    enabled: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) =>
        configureRuntime(nuxt, 'orders', {
          enabled: options.enabled !== false,
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
