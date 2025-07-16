import { defineNuxtModule, createResolver, installModule } from '@nuxt/kit'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configureLayouts } from './config/layouts-config'
import { configurePages } from './config/pages-config'

// Module options interface
export interface ModuleOptions {
  /**
   * Prefix for components
   * @defaultValue `Clean`
   */
  prefix?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-cleanbox',
    configKey: 'fireuxCleanbox',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  defaults: {
    prefix: 'Clean',
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Install fireux-core module first
    await installModule('fireux-core')

    // Configure components
    configureComponents(resolver, options)

    // Configure composables
    configureComposables(resolver)

    // Configure models
    configureModels(resolver, nuxt)

    // Configure layouts
    configureLayouts(resolver, nuxt)

    // Configure pages
    configurePages(resolver, nuxt)

    console.log(
      '🧽 FireUX CleanBox module loaded - Cleaning services functionality ready!'
    )
  },
})
