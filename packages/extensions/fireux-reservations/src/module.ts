import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import { configureComponents } from './config/module/components-config'
import { configureComposables } from './config/module/composables-config'
import { configurePages } from './config/module/pages-config'
import { configureRuntime } from './config/module/runtime-config'
import { configureServer } from './config/module/server-config'

export interface ModuleOptions {
  enabled?: boolean
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fireuxReservations?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    fireuxReservations?: Partial<ModuleOptions>
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-reservations',
    version: '0.1.0',
    configKey: 'fireuxReservations',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: {
    enabled: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    registerReservedRootRouteKeys(['reservations'])

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) =>
        configureRuntime(nuxt, 'reservations', {
          enabled: options.enabled !== false,
        }),
      composables: configureComposables,
      components: configureComponents,
      pages: configurePages,
      server: configureServer,
    })
  },
})
