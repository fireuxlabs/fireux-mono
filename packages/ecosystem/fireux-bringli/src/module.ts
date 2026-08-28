import { createResolver, defineNuxtModule, installModule } from '@nuxt/kit'
import type { Nuxt, NuxtModule } from '@nuxt/schema'
import { configureFireuxEcosystemModule } from 'fireux-core/config/module/ecosystem-wiring'
import { ecosystemConfig } from './config/firebase/ecosystem.config'
import { configureModulePages } from './config/module/pages-config'
import { configurePublicAssets } from './config/module/public-assets-config'

const module: NuxtModule<Record<string, never>> = defineNuxtModule({
  meta: {
    name: 'fireux-bringli',
    version: '0.1.0',
    configKey: 'fireuxBringli',
  },
  async setup(_options: Record<string, never>, nuxt: Nuxt) {
    const resolver = createResolver(import.meta.url)
    const fireux = (nuxt.options.runtimeConfig.public as any)?.fireux
    const workspaces = Array.isArray(fireux?.workspaces)
      ? fireux.workspaces
      : []

    if (workspaces.includes('supplier')) {
      await installModule('fireux-suppliers')
      if (!fireux.modules.includes('fireux-suppliers')) {
        fireux.modules = [...fireux.modules, 'fireux-suppliers']
      }
    }

    configureFireuxEcosystemModule(resolver, nuxt, {
      ecosystem: ecosystemConfig,
      configurePages: configureModulePages,
      configurePublicAssets,
    })

    nuxt.hook('ready', () => {
      if (process.env.FIREUX_DEBUG_LAYERS) {
        console.log('[fireux-bringli] layers', (nuxt.options as any)._layers)
      }
    })
  },
})

export default module
