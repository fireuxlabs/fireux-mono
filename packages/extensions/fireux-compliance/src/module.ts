import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { registerComposablesDir } from 'fireux-core/config/module/module-helpers'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import { configureRuntimeDefaults } from 'fireux-core/config/module/runtime-config'
import { configurePages } from './config/module/pages-config'
import { configureServer } from './config/module/server-config'

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
    registerReservedRootRouteKeys(['compliance'])

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) =>
        configureRuntimeDefaults(
          nuxt,
          'compliance',
          {
            enabled: options.enabled !== false,
            dueSoonDays: 30,
          },
          { merge: true }
        ),
      composables: registerComposablesDir,
      pages: configurePages,
      server: configureServer,
    })
  },
})
