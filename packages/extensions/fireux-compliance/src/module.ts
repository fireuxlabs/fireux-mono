import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { registerComposablesDirs } from 'fireux-core/config/module/module-helpers'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import { configureRuntimeDefaults } from 'fireux-core/config/module/runtime-config'
import { requireNativeRuntimeLayer } from 'fireux-core/config/module/runtime-layer'

export interface ModuleOptions {
  enabled?: boolean
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fireuxCompliance?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    fireuxCompliance?: Partial<ModuleOptions>
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-compliance',
    version: '0.1.0',
    configKey: 'fireuxCompliance',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: {
    enabled: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    registerReservedRootRouteKeys(nuxt, ['compliance'])

    configureRuntimeDefaults(
      nuxt,
      'compliance',
      {
        enabled: options.enabled !== false,
        dueSoonDays: 30,
      },
      { merge: true }
    )
    registerComposablesDirs(resolver, ['./runtime/portfolio/composables'])
    requireNativeRuntimeLayer(resolver, nuxt)
  },
})
