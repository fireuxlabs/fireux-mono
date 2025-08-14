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
   * @defaultValue `Mise`
   */
  prefix?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-misebox',
    configKey: 'fireuxMisebox',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },
  defaults: {
    prefix: 'Mise',
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

    // Add supplier-specific CSS
    nuxt.options.css.push(
      resolver.resolve('./runtime/assets/styles/supplier.scss')
    )

    console.log(
      '🍳 FireUX Misebox module loaded - Chef & Supplier functionality ready!'
    )
  },
})
