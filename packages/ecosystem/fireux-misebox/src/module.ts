// Concurrent edit — 2026-07-21 13:00 CEST — Misebox Jobs workplace adapter: register ecosystem-owned cross-extension composition.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: keep the Kitchen adapter scoped to Professional Experience, outside Job creation.
import { createResolver, defineNuxtModule, installModule } from '@nuxt/kit'
import type { Nuxt, NuxtModule } from '@nuxt/schema'
import { configureFireuxEcosystemModule } from 'fireux-core/config/module/ecosystem-wiring'
import { ecosystemConfig } from './config/firebase/ecosystem.config'
import { configureComponents } from './config/module/components-config'
import { configureModulePages } from './config/module/pages-config'
import { configurePlugins } from './config/module/plugins-config'
import { configurePublicAssets } from './config/module/public-assets-config'
import { configureRuntimeConfig } from './config/module/runtime-config'

const module: NuxtModule<Record<string, never>> = defineNuxtModule({
  meta: {
    name: 'fireux-misebox',
    version: '0.1.0',
    configKey: 'fireuxMisebox',
  },
  async setup(_options: Record<string, never>, nuxt: Nuxt) {
    const resolver = createResolver(import.meta.url)
    const fireux = (nuxt.options.runtimeConfig.public as any)?.fireux
    const workspaces = Array.isArray(fireux?.workspaces)
      ? fireux.workspaces
      : []
    const hasKitchenWorkspace = workspaces.includes('kitchen')

    if (hasKitchenWorkspace) {
      await installModule('fireux-kitchens')
      if (!fireux.modules.includes('fireux-kitchens')) {
        fireux.modules = [...fireux.modules, 'fireux-kitchens']
      }
    }

    configureFireuxEcosystemModule(resolver, nuxt, {
      ecosystem: ecosystemConfig,
      configureRuntimeConfig,
      configurePages: configureModulePages,
      configureComponents,
      configurePublicAssets,
    })
    if (hasKitchenWorkspace) configurePlugins(resolver)

    nuxt.hook('ready', () => {
      if (process.env.FIREUX_DEBUG_LAYERS) {
        console.log('[fireux-misebox] layers', (nuxt.options as any)._layers)
      }
      // fireux-misebox: module configured
    })
  },
})

export default module
