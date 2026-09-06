import { createResolver, defineNuxtModule, installModule } from '@nuxt/kit'
import type { Nuxt, NuxtModule } from '@nuxt/schema'
import { configureFireuxEcosystemModule } from 'fireux-core/config/module/ecosystem-wiring'
import {
  registerComposablesDirs,
  registerServerHandlers,
} from 'fireux-core/config/module/module-helpers'
import { ecosystemConfig } from './config/firebase/ecosystem.config'
import { configureComponents } from './config/module/components-config'
import { configureModulePages } from './config/module/pages-config'

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

const shouldInstallDocs = (nuxt: Nuxt) => {
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const pub = (rc.public ||= {}) as Record<string, any>
  const fireux = (pub.fireux ||= {}) as Record<string, any>
  return (
    fireux.id === 'fireux-app' &&
    (process.env.NODE_ENV === 'production' ||
      process.env.FIREUX_DOCS_ENABLED === 'true')
  )
}

const module: NuxtModule<Record<string, never>> = defineNuxtModule({
  meta: {
    name: 'fireux-fireux',
    version: '0.1.0',
    configKey: 'fireuxFireux',
  },
  async setup(_options: Record<string, never>, nuxt: Nuxt) {
    const resolver = createResolver(import.meta.url)

    if (shouldInstallDocs(nuxt)) {
      await installModule('fireux-docs')
    }

    configureFireuxEcosystemModule(resolver, nuxt, {
      ecosystem: ecosystemConfig,
      configureRuntimeConfig,
      configurePages: configureModulePages,
      configureComponents,
    })
    registerComposablesDirs(resolver, ['./runtime/project/composables'])
    registerServerHandlers(resolver, [
      {
        route: '/api/workspace/project/intent',
        method: 'post',
        handler: './runtime/server/api/workspace/project/intent.post',
      },
    ])
  },
})

export default module
