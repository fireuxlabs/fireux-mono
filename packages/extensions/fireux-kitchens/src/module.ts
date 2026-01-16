import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureComponents } from './config/module/components-config'
import { configureComposables } from './config/module/composables-config'
import { configureLayouts } from './config/module/layouts-config'
import { configureModels } from './config/module/models-config'
import { configurePages } from './config/module/pages-config'
import { configurePlugins } from './config/module/plugins-config'
import { configureRuntime } from './config/module/runtime-config'
import { configureServer } from './config/module/server-config'

export interface ModuleOptions {
  prefix?: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-kitchens',
    version: '0.1.0',
    configKey: 'fireuxKitchens',
  },
  defaults: {
    prefix: 'Fire',
  },
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    configureRuntime(nuxt, 'kitchens')
    configurePlugins(resolver)
    configureComposables(resolver)
    configureComponents(resolver)
    configureLayouts(resolver, nuxt)
    configureModels(resolver)
    configurePages(resolver, nuxt)
    configureServer(resolver)
  },
})

export default module
