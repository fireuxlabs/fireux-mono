// Concurrent edit — 2026-07-21 16:16 CEST — FireUX Finance pass: expose an explicit-import-only finance module.
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { configureComponents } from './config/module/components-config'

export default defineNuxtModule({
  meta: {
    name: 'fireux-finance',
    version: '0.1.0',
    configKey: 'fireuxFinance',
    compatibility: { nuxt: '^4.4.0' },
  },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    configureFireuxModule(resolver, nuxt, {
      components: configureComponents,
    })
  },
})
