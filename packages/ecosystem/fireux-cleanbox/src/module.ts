import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type { Nuxt, NuxtModule } from '@nuxt/schema'
import { configureFireuxEcosystemModule } from 'fireux-core/config/module/ecosystem-wiring'
import { ecosystemConfig } from './config/firebase/ecosystem.config'
import { configureComponents } from './config/module/components-config'

const configureRuntimeConfig = (nuxt: Nuxt) => {
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const pub = (rc.public ||= {}) as Record<string, any>
  const fireux = (pub.fireux ||= {}) as Record<string, any>

  if (!fireux.products || typeof fireux.products !== 'object') {
    fireux.products = { enabled: true }
  }
  if (!fireux.blogs || typeof fireux.blogs !== 'object') {
    fireux.blogs = { enabled: true }
  }
}

const module: NuxtModule<Record<string, never>> = defineNuxtModule({
  meta: {
    name: 'fireux-cleanbox',
    version: '0.1.0',
    configKey: 'fireuxCleanbox',
  },
  async setup(_options: Record<string, never>, nuxt: Nuxt) {
    const resolver = createResolver(import.meta.url)

    configureFireuxEcosystemModule(resolver, nuxt, {
      ecosystem: ecosystemConfig,
      configureRuntimeConfig,
      configureComponents,
    })
  },
})

export default module
