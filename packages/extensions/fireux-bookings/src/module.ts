import {
  addServerImportsDir,
  addComponentsDir,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'

import { requireNativeRuntimeLayer } from 'fireux-core/config/module/runtime-layer'

export default defineNuxtModule<{ businessWorkspace: boolean }>({
  meta: {
    name: 'fireux-bookings',
    version: '0.1.0',
    compatibility: { nuxt: '^4.4.0' },
  },
  defaults: { businessWorkspace: false },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    addServerImportsDir(resolver.resolve('./runtime/server'))
    if (options.businessWorkspace) {
      requireNativeRuntimeLayer(resolver, nuxt)
      addComponentsDir({ path: resolver.resolve('./runtime/business/components'), prefix: 'Bookings', pathPrefix: true })
    }
  },
})
