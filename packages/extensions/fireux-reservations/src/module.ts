import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { registerComposablesDirs } from 'fireux-core/config/module/module-helpers'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import { configureComponents } from './config/module/components-config'
import { configurePages } from './config/module/pages-config'
import { configureRuntimeDefaults } from 'fireux-core/config/module/runtime-config'
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
        configureRuntimeDefaults(
          nuxt,
          'reservations',
          { enabled: options.enabled !== false },
          { merge: true }
        ),
      composables: (resolver) =>
        registerComposablesDirs(resolver, [
          './runtime/composables',
          './runtime/property/composables',
        ]),
      components: configureComponents,
      pages: configurePages,
      server: configureServer,
    })
  },
})
