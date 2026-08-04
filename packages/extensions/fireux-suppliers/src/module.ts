import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import type {
  FireuxSeoExtendContext,
  FireuxSeoSitemapsExtendContext,
} from 'fireux-core/config/app/seo'
import { configureRuntime } from './config/module/runtime-config'
import { configureComposables } from './config/module/composables-config'
import { configureComponents } from './config/module/components-config'
import { configureLayouts } from './config/module/layouts-config'
import { configurePages } from './config/module/pages-config'
import { configureServer } from './config/module/server-config'

export type FireuxSuppliersModuleOptions = {
  /**
   * `owner` exposes the Supplier product, public routes, Console and trusted
   * onboarding. `consumer` exposes only the shared Supplier presentation and
   * projection helpers needed by Kitchen and marketplace consumers.
   */
  mode?: 'owner' | 'consumer'
}

export default defineNuxtModule<FireuxSuppliersModuleOptions>({
  meta: {
    name: 'fireux-suppliers',
    version: '0.1.0',
    configKey: 'fireuxSuppliers',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: {
    mode: 'owner',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const ownsSupplierProduct = options.mode === 'owner'

    if (ownsSupplierProduct) {
      registerReservedRootRouteKeys(['suppliers'])
      nuxt.hook('fireux:seo:extend' as any, (ctx: FireuxSeoExtendContext) => {
        ctx.addHub('/suppliers')
        ctx.addStaticPath('/suppliers/learn-more')
      })
      nuxt.hook(
        'fireux:seo:sitemaps:extend' as any,
        (ctx: FireuxSeoSitemapsExtendContext) => {
          ctx.addEntity({
            entityKey: 'suppliers',
            canonicalCollectionPath: 'suppliers',
            routePrefix: '/suppliers',
            routeIdentity: 'document-id',
            publicField: 'state',
            publicValue: 'public',
          })
          ctx.addEntity({
            entityKey: 'suppliers-official',
            canonicalCollectionPath: 'suppliers',
            routePrefix: '/suppliers',
            routeIdentity: 'document-id',
            publicField: 'state',
            publicValue: 'official',
          })
        }
      )
    }

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) => configureRuntime(nuxt, 'drop'),
      composables: configureComposables,
      components: configureComponents,
      layouts: ownsSupplierProduct ? configureLayouts : undefined,
      pages: ownsSupplierProduct ? configurePages : undefined,
      server: ownsSupplierProduct ? configureServer : undefined,
    })
  },
})
