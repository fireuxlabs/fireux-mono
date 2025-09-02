import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'

import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configurePages } from './config/pages-config'
import { configurePlugins } from './config/plugins-config'
import { configureLayouts } from './config/layouts-config'
import { configureServer } from './config/server-config'
import { configureRuntime } from './config/runtime-config'
import { configureAssets } from './config/assets-config'
import { configureErrors } from './config/errors-config'

const module: NuxtModule = defineNuxtModule({
  meta: {
    name: 'fireux-core',
    version: '1.0.0',
    configKey: 'fireuxCore',
  },
  setup(nuxt) {
    const resolver = createResolver(import.meta.url)

    // ✅ completed

    // ⏭️ next job
    configureRuntime(nuxt, 'core')

    // ❌ not sorted yet
        configureComposables(resolver)

    configureAssets(resolver, nuxt)
    configureErrors(resolver, nuxt)
    configureComponents(resolver)
    configureModels(resolver, nuxt)
    configurePages(resolver, nuxt)
    configurePlugins(resolver)
    configureLayouts(resolver, nuxt)
    configureServer(resolver)

  },
})

export default module

// Re-export config factory for apps
export { createFireuxConfig } from './runtime/utils/fireux-config'
