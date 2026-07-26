import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { configureRuntimeDefaults } from 'fireux-core/config/module/runtime-config'
import { configureComposables } from './config/module/composables-config'
import { configureServer } from './config/module/server-config'

export type FireuxMarketplaceModuleOptions = {
  enabled?: boolean
  currencyCode?: 'CHF'
}

export default defineNuxtModule<FireuxMarketplaceModuleOptions>({
  meta: {
    name: 'fireux-marketplace',
    version: '0.1.0',
    configKey: 'fireuxMarketplace',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: {
    enabled: true,
    currencyCode: 'CHF',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) =>
        configureRuntimeDefaults(
          nuxt,
          'marketplace',
          {
            enabled: options.enabled ?? true,
            currencyCode: options.currencyCode || 'CHF',
          },
          { merge: true }
        ),
      composables: configureComposables,
      server: configureServer,
    })
  },
})
