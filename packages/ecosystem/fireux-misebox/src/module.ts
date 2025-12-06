import { defineNuxtModule, createResolver, installModule } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureRuntime } from './config/runtime-config'
import { configurePlugins } from './config/plugins-config'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureLayouts } from './config/layouts-config'
import { configurePages } from './config/pages-config'
import { configureAssets } from './config/assets-config'
import { primeMiseboxFirebaseEnv } from './config/firebase-env'
import { MISEBOX_FIREBASE_PROJECT } from './config/firebase-project'

export interface ModuleOptions {
  prefix?: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-misebox',
    version: '0.1.0',
    configKey: 'fireuxMisebox',
    dependencies: ['fireux-jobs', 'fireux-places'],
  },
  defaults: {
    prefix: 'Mise',
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    primeMiseboxFirebaseEnv()

    // Core is provided by the app via createFireuxConfig; dependencies install extensions

    await installModule('fireux-jobs')
    await installModule('fireux-places')

    configureRuntime(nuxt, 'misebox')
    configureRuntime(nuxt, 'firebase', {
      projectId: MISEBOX_FIREBASE_PROJECT.projectId,
      authDomain: MISEBOX_FIREBASE_PROJECT.authDomain,
      storageBucket: MISEBOX_FIREBASE_PROJECT.storageBucket,
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
