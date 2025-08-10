import { defineNuxtModule, createResolver, installModule } from '@nuxt/kit'
import { configureRuntime } from './config/runtime-config'
import { configureComposables } from './config/composables-config'
import { configureComponents } from './config/components-config'
import { configureModels } from './config/models-config'

// Module options interface
export interface ModuleOptions {
  /**
   * Google Places API Key
   */
  googlePlacesApiKey?: string

  /**
   * Default country for place searches
   * @defaultValue 'US'
   */
  defaultCountry?: string

  /**
   * Enable autocomplete for addresses
   * @defaultValue true
   */
  enableAutocomplete?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-places',
    configKey: 'fireuxPlaces',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {
    defaultCountry: 'US',
    enableAutocomplete: true,
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Install fireux-core module first
    await installModule('fireux-core')

    // Configure components
    configureComponents(resolver, options)

    // Configure composables
    configureComposables(resolver, options)

    // Configure models
    configureModels(resolver, options)

    // Configure runtime
    configureRuntime(resolver, options)
  },
})
