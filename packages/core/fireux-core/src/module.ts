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
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

  // 1) runtime first (values baked for everything else)
  configureRuntime(nuxt, 'core')

  // 2) plugins next (can read runtime now)
  configurePlugins(resolver)

  // 3) then the rest (uses the same baked config)
  configureComponents(resolver)
  configureComposables(resolver)
  configureModels(resolver, nuxt)
  configurePages(resolver, nuxt)
  configureLayouts(resolver, nuxt)
  configureServer(resolver)
  configureAssets(resolver, nuxt)
  configureErrors(resolver, nuxt)
  },
})

export default module

// Re-export config factory for apps
export { createFireuxConfig } from './runtime/utils/fireux-config'
