import { addServerHandler, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { Nuxt, NuxtModule } from '@nuxt/schema'
import { configureFireuxEcosystemModule } from 'fireux-core/config/module/ecosystem-wiring'
import { ecosystemConfig } from './config/firebase/ecosystem.config'
import { configureComponents } from './config/module/components-config'
import { configureRuntimeConfig } from './config/module/runtime-config'

const module: NuxtModule<Record<string, never>> = defineNuxtModule({
  meta: {
    name: 'fireux-sharer',
    version: '0.1.0',
    configKey: 'fireuxSharer',
  },
  async setup(_options: Record<string, never>, nuxt: Nuxt) {
    const resolver = createResolver(import.meta.url)
    configureFireuxEcosystemModule(resolver, nuxt, {
      ecosystem: ecosystemConfig,
      configureRuntimeConfig,
      configureComponents,
    })
    addServerHandler({
      route: '/api/internal/share-profile',
      method: 'post',
      handler: resolver.resolve(
        './runtime/server/api/internal/share-profile.post'
      ),
    })
    addServerHandler({
      route: '/api/sharer/youtube-channel',
      method: 'get',
      handler: resolver.resolve(
        './runtime/server/api/sharer/youtube-channel.get'
      ),
    })
  },
})

export default module
