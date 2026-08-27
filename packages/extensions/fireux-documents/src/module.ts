import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { registerComposablesDirs } from 'fireux-core/config/module/module-helpers'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import { configureRuntimeDefaults } from 'fireux-core/config/module/runtime-config'
import { configurePages } from './config/module/pages-config'
import { configureServer } from './config/module/server-config'

export interface ModuleOptions {
  enabled?: boolean
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fireuxDocuments?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    fireuxDocuments?: Partial<ModuleOptions>
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-documents',
    version: '0.1.0',
    configKey: 'fireuxDocuments',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: {
    enabled: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    registerReservedRootRouteKeys(['documents'])

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) =>
        configureRuntimeDefaults(
          nuxt,
          'documents',
          {
            enabled: options.enabled !== false,
            maxUploadBytes: 26214400,
          },
          { merge: true }
        ),
      composables: (resolver) =>
        registerComposablesDirs(resolver, [
          './runtime/portfolio/composables',
        ]),
      pages: configurePages,
      server: configureServer,
    })
  },
})
