import { defineNuxtModule } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'

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
  setup(_options, nuxt) {
    console.log('FireUX Core module loaded successfully')

    // Add to nitro experimental features for better compatibility
    nuxt.options.nitro = nuxt.options.nitro || {}
    nuxt.options.nitro.experimental = nuxt.options.nitro.experimental || {}
    nuxt.options.nitro.experimental.wasm = true
  },
})

export default module
