import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { registerComposablesDir } from 'fireux-core/config/module/module-helpers'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import type {
  FireuxSeoExtendContext,
  FireuxSeoSitemapsExtendContext,
} from 'fireux-core/config/app/seo'
import { configureRuntimeDefaults } from 'fireux-core/config/module/runtime-config'
import { configureComponents } from './config/module/components-config'
import { configurePages } from './config/module/pages-config'
import { configureServer } from './config/module/server-config'

export interface ModuleOptions {
  enabled?: boolean
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fireuxProperties?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    fireuxProperties?: Partial<ModuleOptions>
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-properties',
    version: '0.1.0',
    configKey: 'fireuxProperties',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: {
    enabled: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    registerReservedRootRouteKeys(['portfolios', 'properties'])
    nuxt.hook('fireux:seo:extend' as any, (ctx: FireuxSeoExtendContext) => {
      ctx.addHub('/portfolios')
      ctx.addStaticPath('/portfolios/learn-more')
    })
    nuxt.hook(
      'fireux:seo:sitemaps:extend' as any,
      (ctx: FireuxSeoSitemapsExtendContext) => {
        ctx.addEntity({
          entityKey: 'portfolios',
          canonicalCollectionPath: 'portfolios',
          routePrefix: '/portfolios',
          routeIdentity: 'document-id',
          publicField: 'status',
          publicValue: 'active',
        })
      }
    )

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) =>
        configureRuntimeDefaults(
          nuxt,
          'properties',
          { enabled: options.enabled !== false },
          { merge: true }
        ),
      composables: registerComposablesDir,
      components: configureComponents,
      pages: configurePages,
      server: configureServer,
    })
  },
})
