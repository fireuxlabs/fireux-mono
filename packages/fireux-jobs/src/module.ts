import { defineNuxtModule, createResolver } from '@nuxt/kit'
import { configureRuntime } from './runtime-config'
import { configurePages } from './pages-config'
import { configureComposables } from './composables-config'

// Module options interface
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-jobs',
    configKey: 'fireuxJobs',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Configure pages
    configurePages(resolver, nuxt)

    // Configure composables
    configureComposables(resolver)

    // Configure runtime options
    configureRuntime(nuxt, options)
  },
})
