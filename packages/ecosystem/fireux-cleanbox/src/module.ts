import { defineNuxtModule, installModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureRuntime } from 'fireux-core/config/base/runtime-config'
import { configurePlugins } from './config/plugins-config'
import { configureComponents } from './config/components-config'
import { configureComposables } from 'fireux-core/config/base/composables-config'
import { configureLayouts } from './config/layouts-config'
import { configurePages } from 'fireux-core/config/base/pages-config'
import { configureAssets } from './config/assets-config'
import { primeCleanboxFirebaseEnv } from './config/firebase-env'
import { CLEANBOX_FIREBASE_PROJECT } from './config/firebase-project'

export interface ModuleOptions {
  prefix?: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-cleanbox',
    version: '0.1.0',
    configKey: 'fireuxCleanbox',
  },
  defaults: {
    prefix: 'Clean',
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    primeCleanboxFirebaseEnv()

    // Core is provided by the app via createFireuxConfig; do not install here
    await installModule('fireux-jobs')

    configureRuntime(nuxt, 'cleanbox')
    configureRuntime(nuxt, 'firebase', {
      projectId: CLEANBOX_FIREBASE_PROJECT.projectId,
      authDomain: CLEANBOX_FIREBASE_PROJECT.authDomain,
      storageBucket: CLEANBOX_FIREBASE_PROJECT.storageBucket,
    })
    configurePlugins(resolver)
    configureComponents(resolver, options)
    configureComposables(resolver)
    configureLayouts(resolver, nuxt)
    configurePages(resolver, nuxt)
    configureAssets(resolver, nuxt)
    // configureServer(resolver) // toggle as needed

    nuxt.hook('ready', () => {
      console.log('fireux-cleanbox: module configured')
    })
  },
})

export default module
