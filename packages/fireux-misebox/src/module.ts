import { defineNuxtModule, createResolver, installModule } from '@nuxt/kit'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureLayouts } from './config/layouts-config'

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
      nuxt: '^3.0.0',
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

    // Configure layouts
    configureLayouts(resolver, nuxt)

    console.log(
      '🍳 FireUX Misebox module loaded - Chef & Supplier functionality ready!'
    )
  },
})
