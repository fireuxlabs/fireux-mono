import { defineNuxtModule, createResolver, installModule } from '@nuxt/kit'
import { configureRuntime } from './config/runtime-config'
import { configurePages } from './config/pages-config'
import { configureComposables } from './config/composables-config'
import { configureComponents } from './config/components-config'
import { configureModels } from './config/models-config'

// Module options interface
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-jobs',
    configKey: 'fireuxJobs',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Install fireux-core module first
    await installModule('fireux-core')

    // Configure components
    configureComponents(resolver, options)

    // Configure pages
    configurePages(resolver, nuxt)

    // Configure composables
    configureComposables(resolver)

    // Configure models
    configureModels(resolver, nuxt)

    // Add theme colors for job profiles
    ;(nuxt.options as any).appConfig = (nuxt.options as any).appConfig || {}
    ;(nuxt.options as any).appConfig.ui =
      (nuxt.options as any).appConfig.ui || {}
    ;(nuxt.options as any).appConfig.ui.colors =
      (nuxt.options as any).appConfig.ui.colors || {}
    ;(nuxt.options as any).appConfig.ui.colors.professional = 'indigo'
    ;(nuxt.options as any).appConfig.ui.colors.employer = 'red'

    // Configure runtime options
    configureRuntime(nuxt, options)
  },
})
