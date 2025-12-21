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
import { CLEANBOX_FIREBASE_PROJECT } from './config/firebase-project'
import { ecosystemConfig } from './config/firebase/ecosystem.config'

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

    // Core and any extensions are provided by the app via createFireuxConfig

    configureRuntime(nuxt, 'cleanbox')
    configureRuntime(nuxt, 'firebase', {
      apiKey: CLEANBOX_FIREBASE_PROJECT.apiKey,
      projectId: CLEANBOX_FIREBASE_PROJECT.projectId,
      authDomain: CLEANBOX_FIREBASE_PROJECT.authDomain,
      storageBucket: CLEANBOX_FIREBASE_PROJECT.storageBucket,
      messagingSenderId: CLEANBOX_FIREBASE_PROJECT.messagingSenderId,
    })

    // Preferred runtime shape (used by fireux-nuxtfire / nuxt-vuefire config)
    setRuntimeFirebaseEcosystem(nuxt as any, {
      id: ecosystemConfig.id,
      name: ecosystemConfig.name,
      description: ecosystemConfig.description,
      firebase: ecosystemConfig.firebase,
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
