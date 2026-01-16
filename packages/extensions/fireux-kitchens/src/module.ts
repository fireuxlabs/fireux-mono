import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configurePages } from './config/pages-config'
import { configureRuntime } from './config/runtime-config'

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
    configureComposables(resolver)
    configureComponents(resolver)
    configurePages(resolver, nuxt)
  },
})

export default module
