import { defineNuxtModule, createResolver } from '@nuxt/kit'
// import { version } from '../package.json'
import { configureRuntime } from './runtime-config'
import { configureServer } from './server-config'
import { configureLayouts } from './layouts-config'
import { configureComponents } from './components-config'
import { configureAssets } from './assets-config'
import { configurePlugins } from './plugins-config'
import { configureComposables } from './composables-config'
import { configurePages } from './pages-config'
// import { configurePWA } from './pwa-config'

// Module options interface
export interface ModuleOptions {
  /**
   * Prefix for components
   * @defaultValue `Fire`
   */
  prefix?: string
  
  /**
   * Enable PWA functionality
   * @defaultValue `true`
   */
  pwa?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-core',
    version: '1.0.0',
    configKey: 'fireuxCore',
  },
  defaults: {
    prefix: 'Fire',
    pwa: true,
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

    // Configure PWA (temporarily disabled for debugging)
    // if (options.pwa !== false) {
    //   configurePWA(nuxt)
    // }
  },
})
