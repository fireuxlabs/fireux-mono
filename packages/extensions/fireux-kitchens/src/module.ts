import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureRuntime } from './config/runtime-config'
import { configureComposables } from './config/composables-config'
import { configurePages } from './config/pages-config'

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
    configurePages(resolver, nuxt)
  },
})

export default module
