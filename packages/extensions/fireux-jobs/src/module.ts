import { defineNuxtModule, createResolver } from '@nuxt/kit'

import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configurePages } from './config/pages-config'
import { configurePlugins } from './config/plugins-config'
import { configureLayouts } from './config/layouts-config'
import { configureServer } from './config/server-config'
import { configureRuntime } from './config/runtime-config'

export interface ModuleOptions {
  prefix?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-jobs',
    version: '1.0.0',
    configKey: 'fireuxJobs',
  },
  defaults: { prefix: 'Fire' },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
  configureComponents(resolver, options)
  configureComposables(resolver)
    configurePages(resolver, nuxt)
    configurePlugins(resolver)
    configureLayouts(resolver, nuxt)
    configureServer(resolver)
    configureRuntime(nuxt, 'jobs')
    // Safe nitro tweak
    nuxt.options.nitro ||= {}
    nuxt.options.nitro.experimental ||= {}
    nuxt.options.nitro.experimental.wasm = true
  },
})
