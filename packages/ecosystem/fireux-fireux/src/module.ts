import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type { Nuxt, NuxtModule } from '@nuxt/schema'
import { configureFireuxEcosystemModule } from 'fireux-core/config/module/ecosystem-wiring'
import {
  registerComposablesDirs,
  registerServerHandlers,
} from 'fireux-core/config/module/module-helpers'
import { ecosystemConfig } from './config/firebase/ecosystem.config'
import { configureComponents } from './config/module/components-config'
import { configureModulePages } from './config/module/pages-config'

const module: NuxtModule<Record<string, never>> = defineNuxtModule({
  meta: {
    name: 'fireux-fireux',
    version: '0.1.0',
    configKey: 'fireuxFireux',
  },
  async setup(_options: Record<string, never>, nuxt: Nuxt) {
    const resolver = createResolver(import.meta.url)
    const hasProjectWorkspace =
      nuxt.options.runtimeConfig.public?.fireux?.workspaces?.includes(
        'project'
      ) === true

    configureFireuxEcosystemModule(resolver, nuxt, {
      ecosystem: ecosystemConfig,
      configurePages: configureModulePages,
      ...(hasProjectWorkspace ? { configureComponents } : {}),
    })
    if (!hasProjectWorkspace) return

    registerComposablesDirs(resolver, ['./runtime/project/composables'])
    registerServerHandlers(resolver, [
      {
        route: '/api/workspace/project/tests/intent',
        method: 'post',
        handler: './runtime/project/server/http/test-intent.post',
      },
      {
        route: '/api/workspace/project/intent',
        method: 'post',
        handler: './runtime/project/server/http/intent.post',
      },
    ])
  },
})

export default module
