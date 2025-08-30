import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configurePages } from './config/pages-config'
import { configurePlugins } from './config/plugins-config'
import { configureServer } from './config/server-config'
import { configureRuntime } from './config/runtime-config'

// Module options interface
export interface ModuleOptions {
  /**
   * Prefix for components
   * @defaultValue `Fire`
   */
  prefix?: string
}

// Define and export the module with explicit typing to avoid build issues
const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
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

    // Configure all aspects of the module
    configureComponents(resolver, options)
    configureComposables(resolver)
    configureModels(resolver, nuxt)
    configurePages(resolver, nuxt)
    configurePlugins(resolver)
    configureServer(resolver)
    configureRuntime(nuxt)

    // Add to nitro experimental features for better compatibility
    nuxt.options.nitro = nuxt.options.nitro || {}
    nuxt.options.nitro.experimental = nuxt.options.nitro.experimental || {}
    nuxt.options.nitro.experimental.wasm = true

    console.log(
      '🔥 FireUX Core module configured successfully with all features'
    )
  },
})

export default module
