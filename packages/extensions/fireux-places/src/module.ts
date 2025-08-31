import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configurePages } from './config/pages-config'
import { configurePlugins } from './config/plugins-config'
import { configureServer } from './config/server-config'
import { configureLayouts } from './config/layouts-config'
import { configureRuntime } from './config/runtime-config'

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

    // Delegate to config functions
    await configureComponents(resolver, options)
    await configureComposables(resolver, options)
    await configureModels(resolver, options)
    configurePages(resolver, nuxt)
    configurePlugins(resolver)
    configureLayouts(resolver, nuxt)
    configureServer(resolver)
    configureRuntime(nuxt, 'places')

    // Nitro tweak
    nuxt.options.nitro ||= {}
    nuxt.options.nitro.experimental ||= {}
    nuxt.options.nitro.experimental.wasm = true

    nuxt.hook('ready', () => {
      // eslint-disable-next-line no-console
      console.log(
        'fireux-places: module configured (components/composables/models/runtime)'
      )
    })
  },
})

export default module
