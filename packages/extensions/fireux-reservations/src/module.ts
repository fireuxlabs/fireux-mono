import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { registerComposablesDirs } from 'fireux-core/config/module/module-helpers'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import { configureComponents } from './config/module/components-config'
import { requireNativeRuntimeLayer } from 'fireux-core/config/module/runtime-layer'
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
    registerReservedRootRouteKeys(nuxt, ['reservations'])

    configureRuntimeDefaults(
      nuxt,
      'reservations',
      { enabled: options.enabled !== false },
      { merge: true }
    )
    registerComposablesDirs(resolver, ['./runtime/property/composables'])
    configureComponents(resolver)
    requireNativeRuntimeLayer(resolver, nuxt)
    configureServer(resolver)
  },
})
