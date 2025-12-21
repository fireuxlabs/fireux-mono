// FILE: packages/core/fireux-core/src/module.ts
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configurePlugins } from './config/module/plugins-config'
import { configurePages } from './config/module/pages-config'
import { configureLayouts } from './config/module/layouts-config'
import { configureComponents } from './config/module/components-config'
import { configureComposables } from './config/module/composables-config'
import { configureAssets } from './config/module/assets-config'
import { configureAliases } from './config/module/aliases-config'

export default defineNuxtModule({
  meta: {
    name: 'fireux-core',
    version: '0.1.0',
  },

  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // runtime alias
    nuxt.options.alias = nuxt.options.alias || {}
    nuxt.options.alias['fireux-core/runtime'] = resolver.resolve('./runtime')

    // ✅ inject runtime plugins into consuming apps
    configurePlugins(resolver)

    // ✅ expose fireux-core runtime as a Nuxt layer (pages/layouts/middleware)
    configurePages(resolver, nuxt as any)
    configureLayouts(resolver)
    configureComponents(resolver)
    configureComposables(resolver)
    configureAssets(resolver, nuxt as any)
    configureAliases(resolver, nuxt as any)
  },
})