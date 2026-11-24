import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { registerComposablesDirs } from 'fireux-core/config/module/module-helpers'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import { configureRuntimeDefaults } from 'fireux-core/config/module/runtime-config'
import { requireNativeRuntimeLayer } from 'fireux-core/config/module/runtime-layer'
import { configureServer } from './config/module/server-config'

export interface ModuleOptions {
  enabled?: boolean
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fireuxTasks?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    fireuxTasks?: Partial<ModuleOptions>
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-tasks',
    version: '0.1.0',
    configKey: 'fireuxTasks',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: {
    enabled: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    registerReservedRootRouteKeys(nuxt, ['tasks'])

    configureRuntimeDefaults(
      nuxt,
      'tasks',
      { enabled: options.enabled !== false },
      { merge: true }
    )
    registerComposablesDirs(resolver, ['./runtime/portfolio/composables'])
    requireNativeRuntimeLayer(resolver, nuxt)
    configureServer(resolver)
  },
})
