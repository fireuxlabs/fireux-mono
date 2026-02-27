import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type { Nuxt, NuxtModule } from '@nuxt/schema'
import { setRuntimeFirebaseEcosystem } from 'fireux-core/config/app/runtime'
import { ecosystemConfig } from './config/firebase/ecosystem.config'
import { configureComponents } from './config/module/components-config'
import { configureImports } from './config/module/imports-config'
import { configureModulePages } from './config/module/pages-config'
import { configurePublicAssets } from './config/module/public-assets-config'
import { configureRuntimeConfig } from './config/module/runtime-config'

const module: NuxtModule<Record<string, never>> = defineNuxtModule({
  meta: {
    name: 'fireux-granite',
    version: '0.1.0',
    configKey: 'fireuxGranite',
  },
  async setup(_options: Record<string, never>, nuxt: Nuxt) {
    const resolver = createResolver(import.meta.url)

    setRuntimeFirebaseEcosystem(nuxt as any, {
      id: ecosystemConfig.id,
      name: ecosystemConfig.name,
      description: ecosystemConfig.description,
      firebase: ecosystemConfig.firebase,
    })

    configureRuntimeConfig(nuxt)
    configureModulePages(resolver, nuxt)
    configureComponents(resolver, nuxt)
    configureImports(resolver, nuxt)
    configurePublicAssets(resolver, nuxt)

    nuxt.hook('ready', () => {
      if (process.env.FIREUX_DEBUG_LAYERS) {
        console.log('[fireux-granite] layers', (nuxt.options as any)._layers)
      }
    })
  },
})

export default module
