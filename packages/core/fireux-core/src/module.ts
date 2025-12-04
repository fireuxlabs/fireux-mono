import { defineNuxtModule, createResolver } from '@nuxt/kit'

import { configureRuntime } from './config/runtime-config'
import { configureDeployIgnore } from './config/deploy-ignore-config'
import { configurePlugins } from './config/plugins-config'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureLayouts } from './config/layouts-config'
import { configurePages } from './config/pages-config'
import { configureServer } from './config/server-config'
import { configureAssets } from './config/assets-config'
import { configureErrors } from './config/errors-config'

export default defineNuxtModule({
  meta: { name: 'fireux-core', version: '1.0.0', configKey: 'fireuxCore' },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // 1) runtime first
    configureRuntime(nuxt, 'core')

    // 2) apply deploy ignores before Nuxt starts scanning files
    configureDeployIgnore(nuxt)

    // 3) plugins (can read runtime)
    configurePlugins(resolver)

    // 4) components
    configureComponents(resolver)

    // 5) composables
    configureComposables(resolver)

    // 6) layouts
    configureLayouts(resolver, nuxt)

    // 7) pages
    configurePages(resolver, nuxt)

    // 8) server (api/middleware)
    configureServer(resolver)

    // 9) assets
    configureAssets(resolver, nuxt)

    // 10) errors
    configureErrors(resolver, nuxt)
  },
})
export { createFireuxConfig } from './config/fireux/fireux-config'
