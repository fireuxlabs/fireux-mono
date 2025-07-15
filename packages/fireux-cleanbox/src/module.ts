import { createResolver, defineNuxtModule, addComponentsDir } from '@nuxt/kit'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureLayouts } from './config/layouts-config'
import { configureModels } from './config/models-config'
import { configurePages } from './config/pages-config'

export interface ModuleOptions {
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
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Configure package components, composables, layouts, models, and pages
    configureComponents(resolver, options)
    configureComposables(resolver)
    configureLayouts(resolver)
    configureModels(resolver, nuxt)
    configurePages(resolver, nuxt)

    console.log(
      '🧽 FireUX CleanBox module loaded - Cleaning services functionality ready!'
    )
  },
})
