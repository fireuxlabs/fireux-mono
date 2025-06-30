import { defineNuxtModule, createResolver } from '@nuxt/kit'
// import { version } from '../package.json'
import { configureRuntime } from './config/runtime-config'
import { configureServer } from './config/server-config'
import { configureLayouts } from './config/layouts-config'
import { configureComponents } from './config/components-config'
import { configureAssets } from './config/assets-config'
import { configurePlugins } from './config/plugins-config'
import { configureComposables } from './config/composables-config'
import { configurePages } from './config/pages-config'

// Module options interface
export interface ModuleOptions {
  /**
   * Prefix for components
   * @defaultValue `Fire`
   */
  prefix?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-core',
    version: '1.0.0',
    configKey: 'fireuxCore',
  },
  defaults: {
    prefix: 'Fire',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Configure components
    configureComponents(resolver, options)

    // Configure layouts
    configureLayouts(resolver, nuxt)

    // Configure pages
    configurePages(resolver, nuxt)

    // Configure composables
    configureComposables(resolver)

    // Configure server-side functionality
    configureServer(resolver)

    // Configure runtime options
    configureRuntime(nuxt)

    // Configure plugins
    configurePlugins(resolver)

    // Configure public assets
    configureAssets(resolver, nuxt)
  },
})
