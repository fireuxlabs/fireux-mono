// FILE: packages/core/fireux-core/src/module.ts
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from './config/module/module-wiring'
import { configurePlugins } from './config/module/plugins-config'
import { configureComposables } from './config/module/composables-config'
import { configureComponents } from './config/module/components-config'
import { configureLayouts } from './config/module/layouts-config'
import { configurePages } from './config/module/pages-config'
import { configureAssets } from './config/module/assets-config'

export default defineNuxtModule({
  meta: {
    name: 'fireux-core',
    version: '0.1.0',
  },

  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    configureFireuxModule(resolver, nuxt, {
      plugins: configurePlugins,
      composables: configureComposables,
      components: configureComponents,
      layouts: configureLayouts,
      pages: configurePages,
      assets: configureAssets,
    })
  },
})
