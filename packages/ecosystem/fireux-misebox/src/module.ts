import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { setRuntimeFirebaseEcosystem } from 'fireux-core/config/app/runtime'

import { configurePlugins } from './config/plugins-config'
import { configureComponents } from './config/components-config'
import { configureLayouts } from './config/layouts-config'
import { configureAssets } from './config/assets-config'
import { configureRuntime } from './config/runtime-config'
import { configureComposables } from './config/composables-config'
import { configurePages } from './config/pages-config'
import { ecosystemConfig } from './config/firebase/ecosystem.config'
import { firebaseEcosystem } from './config/firebase-ecosystem'

export interface ModuleOptions {
  prefix?: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-misebox',
    version: '0.1.0',
    configKey: 'fireuxMisebox',
  },
  defaults: {
    prefix: 'Mise',
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Core and any extensions are provided by the app via createFireuxConfig

    configureRuntime(nuxt, 'misebox')

    setRuntimeFirebaseEcosystem(nuxt as any, {
      id: ecosystemConfig.id,
      name: ecosystemConfig.name,
      description: ecosystemConfig.description,
      firebase: firebaseEcosystem,
    })
    configurePlugins(resolver)
    configureComponents(resolver, options)
    configureComposables(resolver)
    configureLayouts(resolver, nuxt)
    configurePages(resolver, nuxt)
    configureAssets(resolver, nuxt)
    // configureServer(resolver) // toggle as needed

    nuxt.hook('ready', () => {
      if (process.env.FIREUX_DEBUG_LAYERS) {
        console.log('[fireux-misebox] layers', (nuxt.options as any)._layers)
      }
      // fireux-misebox: module configured
    })
  },
})

export default module
