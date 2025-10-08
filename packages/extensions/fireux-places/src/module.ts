import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureRuntime } from './config/runtime-config'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configurePages } from './config/pages-config'
import { configureServer } from './config/server-config'

export interface ModuleOptions {
  prefix?: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-places',
    version: '0.1.0',
    configKey: 'fireuxPlaces',
  },
  defaults: {
    prefix: 'Fire',
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    configureRuntime(nuxt, 'places')
    configureComponents(resolver, options)
    configureComposables(resolver, options)
    configurePages(resolver, nuxt)
    configureServer(resolver)
  },
})

export default module
