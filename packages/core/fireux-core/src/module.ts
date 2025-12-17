import { createResolver, defineNuxtModule } from '@nuxt/kit'

import { configureComponents } from './config/module/components-config'
import { configureComposables } from './config/module/composables-config'
import { configureLayouts } from './config/module/layouts-config'
import { configurePages } from './config/module/pages-config'
import { configurePlugins } from './config/module/plugins-config'
import { configureRuntime } from './config/module/runtime-config'
import { configureServer } from './config/module/server-config'
import { configureModels } from './config/module/models-config'

export default defineNuxtModule({
  meta: {
    name: 'fireux-core',
    version: '0.1.0',
    configKey: 'fireuxCore',
  },

  setup(_options, nuxt) {
    console.info('[fireux-core] hello')

    const resolver = createResolver(import.meta.url)

    // Mount core runtime as a Nuxt layer and wire runtime conveniences.
    configurePages(resolver, nuxt)
    configureComponents(resolver)
    configureComposables(resolver)
    configureLayouts(resolver, nuxt)
    configurePlugins(resolver)
    configureServer(resolver)
    configureModels(resolver)

    // A small namespace marker (no ecosystem-specific config here).
    configureRuntime(nuxt, 'core')
  },
})
