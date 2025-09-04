import { defineNuxtModule, createResolver, installModule } from '@nuxt/kit'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configurePages } from './config/pages-config'
import { configureLayouts } from './config/layouts-config'
import { configureRuntime } from './config/runtime-config'
import { configurePlugins } from './config/plugins-config'
import { configureServer } from './config/server-config'

export interface ModuleOptions {
  prefix?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: { name: 'fireux-fireux', version: '0.1.0', configKey: 'fireuxFireux' },
  defaults: { prefix: 'Fireux' },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Install core dependency
    await installModule('fireux-core')

  // Delegate to config functions
    configureComponents(resolver, options)
    configureComposables(resolver)
    configureModels(resolver, nuxt)
    configurePages(resolver, nuxt)
    configureLayouts(resolver, nuxt)
    configurePlugins(resolver)
    configureServer(resolver)
    configureRuntime(nuxt, 'fireux')

  // Nitro tweak
    nuxt.options.nitro ||= {}
    nuxt.options.nitro.experimental ||= {}
    nuxt.options.nitro.experimental.wasm = true

    nuxt.hook('ready', () => {
      // eslint-disable-next-line no-console
      console.log('fireux-fireux: module configured')
    })
  },
})
