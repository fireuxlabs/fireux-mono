import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'

import { configureRuntime } from './config/runtime-config'
import { configurePlugins } from './config/plugins-config'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureLayouts } from './config/layouts-config'
import { configurePages } from './config/pages-config'
import { configureAssets } from './config/assets-config'
import { configureErrors } from './config/errors-config'

const module: NuxtModule = defineNuxtModule({
  meta: { name: 'fireux-core', version: '1.0.0', configKey: 'fireuxCore' },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    configureRuntime(nuxt, 'core')
    configurePlugins(resolver)
    configureComponents(resolver)
    configureComposables(resolver)
    configureLayouts(resolver, nuxt)
    configurePages(resolver, nuxt)
    // configureServer(resolver) // toggle as needed
    configureAssets(resolver, nuxt)
    configureErrors(resolver, nuxt)

    nuxt.hook('ready', () => {
      console.log('fireux-core: module configured')
    })
  },
})

export default module
export { createFireuxConfig } from './runtime/utils/fireux-config'
