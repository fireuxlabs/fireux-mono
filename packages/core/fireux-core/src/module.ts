import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'

import { configureRuntime } from './config/runtime-config'
import { configurePlugins } from './config/plugins-config'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configureLayouts } from './config/layouts-config'
import { configurePages } from './config/pages-config'
import { configureServer } from './config/server-config'
import { configureAssets } from './config/assets-config'
import { configureErrors } from './config/errors-config'

const module: NuxtModule = defineNuxtModule({
  meta: { name: 'fireux-core', version: '1.0.0', configKey: 'fireuxCore' },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // 1) runtime first
    configureRuntime(nuxt, 'core')

    // 2) plugins (can read runtime)
    configurePlugins(resolver)

    // 3) components
    configureComponents(resolver)

    // 4) composables
    configureComposables(resolver)

    // 5) models
    configureModels(resolver, nuxt)

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

export default module
export { createFireuxConfig } from './runtime/utils/fireux-config'
