import { createResolver, defineNuxtModule, installModule } from '@nuxt/kit'
import type { Nuxt, NuxtModule } from '@nuxt/schema'
import { configureFireuxEcosystemModule } from 'fireux-core/config/module/ecosystem-wiring'
import { ecosystemConfig } from './config/firebase/ecosystem.config'

const module: NuxtModule<Record<string, never>> = defineNuxtModule({
  meta: {
    name: 'fireux-buenohost',
    version: '0.1.0',
    configKey: 'fireuxBuenohost',
  },
  async setup(_options: Record<string, never>, nuxt: Nuxt) {
    const resolver = createResolver(import.meta.url)
    const fireux = (nuxt.options.runtimeConfig.public as any)?.fireux
    const workspaces = Array.isArray(fireux?.workspaces)
      ? fireux.workspaces
      : []

    if (workspaces.includes('property')) {
      await installModule('fireux-properties')
      await installModule('fireux-reservations')
      for (const name of ['fireux-properties', 'fireux-reservations']) {
        if (!fireux.modules.includes(name)) {
          fireux.modules = [...fireux.modules, name]
        }
      }
    }

    configureFireuxEcosystemModule(resolver, nuxt, {
      ecosystem: ecosystemConfig,
    })
  },
})

export default module
