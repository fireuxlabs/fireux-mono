import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { registerComposablesDirs } from 'fireux-core/config/module/module-helpers'
import type {
  FireuxSeoExtendContext,
} from 'fireux-core/config/app/seo'
import { configureRuntimeDefaults } from 'fireux-core/config/module/runtime-config'
import { configureComponents } from './config/module/components-config'
import { configurePages } from './config/module/pages-config'
import { configureServer } from './config/module/server-config'

export interface ModuleOptions {
  prefix?: string
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fireuxBusinesses?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    fireuxBusinesses?: Partial<ModuleOptions>
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-businesses',
    version: '2.0.0',
    configKey: 'fireuxBusinesses',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: { prefix: 'Fire' },
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    nuxt.hook('fireux:seo:extend' as any, (ctx: FireuxSeoExtendContext) => {
      ctx.addHub('/businesses')
      ctx.addStaticPath('/businesses/learn-more')
    })


    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) =>
        configureRuntimeDefaults(
          nuxt,
          'businesses',
          { enabled: true },
          { merge: true }
        ),
      composables: (resolver) =>
        registerComposablesDirs(resolver, [
          './runtime/business/composables',
        ]),
      components: configureComponents,
      pages: configurePages,
      server: configureServer,
    })
  },
})
