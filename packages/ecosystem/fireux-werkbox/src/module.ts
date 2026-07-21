// Concurrent edit — 2026-07-21 14:40 CEST — Werkbox Firebase hardening: expose a build-bound security-contract attestation on every Werkbox App.
import { addServerHandler, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { Nuxt, NuxtModule } from '@nuxt/schema'
import { configureFireuxEcosystemModule } from 'fireux-core/config/module/ecosystem-wiring'
import { ecosystemConfig } from './config/firebase/ecosystem.config'
import { configureComponents } from './config/module/components-config'

const module: NuxtModule<Record<string, never>> = defineNuxtModule({
  meta: {
    name: 'fireux-werkbox',
    version: '0.1.0',
    configKey: 'fireuxWerkbox',
  },
  async setup(_options: Record<string, never>, nuxt: Nuxt) {
    const resolver = createResolver(import.meta.url)

    configureFireuxEcosystemModule(resolver, nuxt, {
      ecosystem: ecosystemConfig,
      configureComponents,
    })
    addServerHandler({
      route: '/api/internal/werkbox/security-contract',
      method: 'get',
      handler: resolver.resolve(
        './runtime/server/api/internal/werkbox/security-contract.get'
      ),
    })
  },
})

export default module
