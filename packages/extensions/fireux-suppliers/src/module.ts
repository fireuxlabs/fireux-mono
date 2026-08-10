import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { registerComposablesDir } from 'fireux-core/config/module/module-helpers'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import type {
  FireuxSeoExtendContext,
  FireuxSeoSitemapsExtendContext,
} from 'fireux-core/config/app/seo'
import { configureComponents } from './config/module/components-config'
import { configurePages } from './config/module/pages-config'
import { configureServer } from './config/module/server-config'
import { registerFireuxConsole } from 'fireux-core/config/module/runtime-config'

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
      registerFireuxConsole(nuxt, {
        family: 'supplier',
        rootCollection: 'suppliers',
        appSupportCollection: 'suppliers',
        supportsInlineNotes: true,
      })
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
      composables: registerComposablesDir,
      components: configureComponents,
      pages: ownsSupplierProduct ? configurePages : undefined,
      server: ownsSupplierProduct ? configureServer : undefined,
    })
  },
})
