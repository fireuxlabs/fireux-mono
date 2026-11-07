import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type { Nuxt, NuxtModule } from '@nuxt/schema'
import { configureFireuxEcosystemModule } from 'fireux-core/config/module/ecosystem-wiring'
import { ecosystemConfig } from './config/firebase/ecosystem.config'

const WORKSPACE_MODULES = ['fireux-suppliers'] as const

const module: NuxtModule<Record<string, never>> = defineNuxtModule({
  meta: {
    name: 'fireux-bringli',
    version: '0.1.0',
    configKey: 'fireuxBringli',
  },
  moduleDependencies(nuxt) {
    const workspaces =
      nuxt.options.runtimeConfig.public.fireux?.workspaces || []
    return workspaces.includes('supplier')
      ? Object.fromEntries(WORKSPACE_MODULES.map((name) => [name, {}]))
      : {}
  },
  setup(_options: Record<string, never>, nuxt: Nuxt) {
    const resolver = createResolver(import.meta.url)
    const fireux = (nuxt.options.runtimeConfig.public as any)?.fireux
    const workspaces = Array.isArray(fireux?.workspaces)
      ? fireux.workspaces
      : []

    if (workspaces.includes('supplier')) {
      fireux.modules = [...new Set([...fireux.modules, ...WORKSPACE_MODULES])]
    }

    configureFireuxEcosystemModule(resolver, nuxt, {
      ecosystem: ecosystemConfig,
    })
  },
})

export default module
