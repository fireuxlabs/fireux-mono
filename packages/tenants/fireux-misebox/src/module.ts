import { defineNuxtModule, installModule, createResolver } from '@nuxt/kit'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configurePages } from './config/pages-config'
import { configureLayouts } from './config/layouts-config'
import { configureRuntime } from './config/runtime-config'
import { configurePlugins } from './config/plugins-config'
import { configureServer } from './config/server-config'

export interface ModuleOptions {
  prefix?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-misebox',
    version: '0.1.0',
    configKey: 'fireuxMisebox',
  },
  defaults: {
    prefix: 'Mise',
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Install core dependency
    await installModule('fireux-core')

    // Delegate to config functions
    configureComponents(resolver, options)
    configureComposables(resolver)
    configurePages(resolver, nuxt)
    configureLayouts(resolver, nuxt)
    configurePlugins(resolver)
    configureServer(resolver)
    configureRuntime(nuxt, 'misebox')

    // Nitro tweak
    nuxt.options.nitro ||= {}
    nuxt.options.nitro.experimental ||= {}
    nuxt.options.nitro.experimental.wasm = true

    nuxt.hook('ready', () => {
      // eslint-disable-next-line no-console
      console.log('fireux-misebox: module configured')
    })
  },
})
