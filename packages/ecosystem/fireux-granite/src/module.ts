import { createResolver, defineNuxtModule, installModule } from '@nuxt/kit'
import type { Nuxt, NuxtModule } from '@nuxt/schema'
import { configureFireuxEcosystemModule } from 'fireux-core/config/module/ecosystem-wiring'
import { ecosystemConfig } from './config/firebase/ecosystem.config'
import { configureComponents } from './config/module/components-config'
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
    const fireux = (nuxt.options.runtimeConfig.public as any)?.fireux
    const workspaces = Array.isArray(fireux?.workspaces)
      ? fireux.workspaces
      : []

    if (workspaces.includes('portfolio')) {
      for (const name of [
        'fireux-properties',
        'fireux-compliance',
        'fireux-documents',
        'fireux-tasks',
      ]) {
        await installModule(name)
        if (!fireux.modules.includes(name)) {
          fireux.modules = [...fireux.modules, name]
        }
      }
    }

    configureFireuxEcosystemModule(resolver, nuxt, {
      ecosystem: ecosystemConfig,
      configureRuntimeConfig,
      configurePages: configureModulePages,
      configureComponents,
      configurePublicAssets,
    })

    nuxt.hook('ready', () => {
      if (process.env.FIREUX_DEBUG_LAYERS) {
        console.log('[fireux-granite] layers', (nuxt.options as any)._layers)
      }
    })
  },
})

export default module
