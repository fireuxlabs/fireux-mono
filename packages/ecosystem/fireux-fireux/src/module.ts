import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configurePlugins } from './config/plugins-config'
import { configureComponents } from './config/components-config'
import { configureLayouts } from './config/layouts-config'
import { configureRuntime } from './config/runtime-config'
import { configureComposables } from './config/composables-config'
import { configurePages } from './config/pages-config'
import { primeFireuxFirebaseEnv } from './config/firebase-env'
import { FIREUX_FIREBASE_PROJECT } from './config/firebase-project'

export interface ModuleOptions {
  prefix?: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-fireux',
    version: '0.1.0',
    configKey: 'fireuxFireux',
  },
  defaults: { prefix: 'Fireux' },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    primeFireuxFirebaseEnv()

    // Core is provided by the app via createFireuxConfig; do not install here

    configureRuntime(nuxt, 'fireux')
    configureRuntime(nuxt, 'firebase', {
      projectId: FIREUX_FIREBASE_PROJECT.projectId,
      authDomain: FIREUX_FIREBASE_PROJECT.authDomain,
      storageBucket: FIREUX_FIREBASE_PROJECT.storageBucket,
      registryDatabaseId: FIREUX_FIREBASE_PROJECT.registryDatabaseId,
    })
    configurePlugins(resolver)
    configureComponents(resolver, options)
    configureComposables(resolver)
    configureLayouts(resolver, nuxt)
    configurePages(resolver, nuxt)
    // configureServer(resolver) // toggle as needed

    nuxt.hook('ready', () => {
      if (process.env.FIREUX_DEBUG_LAYERS) {
        console.log('fireux-fireux: module configured')
      }
    })
  },
})

export default module
