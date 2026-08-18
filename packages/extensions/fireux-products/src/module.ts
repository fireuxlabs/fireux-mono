import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { registerComposablesDirs } from 'fireux-core/config/module/module-helpers'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import type {
  FireuxSeoExtendContext,
  FireuxSeoSitemapsExtendContext,
} from 'fireux-core/config/app/seo'
import { configureComponents } from './config/module/components-config'
import { configurePages } from './config/module/pages-config'
import { configureServer } from './config/module/server-config'

export type FireuxProductsModuleOptions = {
  productKinds?: string[]
  enabled?: boolean
}

function setProductsRuntime(nuxt: any, overrides: Record<string, any>) {
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const pub = (rc.public ||= {}) as Record<string, any>
  const fireux = (pub.fireux ||= {}) as Record<string, any>
  const current =
    fireux.products &&
    typeof fireux.products === 'object' &&
    !Array.isArray(fireux.products)
      ? fireux.products
      : {}
  fireux.products = { ...current, ...overrides }
}

export default defineNuxtModule({
  meta: {
    name: 'fireux-products',
    version: '0.1.0',
    configKey: 'fireuxProducts',
    compatibility: { nuxt: '^4.1.0' },
  },
  setup(options: FireuxProductsModuleOptions = {}, nuxt) {
    const resolver = createResolver(import.meta.url)
    registerReservedRootRouteKeys(['products'])
    nuxt.hook('fireux:seo:extend' as any, (ctx: FireuxSeoExtendContext) => {
      ctx.addHub('/products')
    })
    nuxt.hook(
      'fireux:seo:sitemaps:extend' as any,
      (ctx: FireuxSeoSitemapsExtendContext) => {
        ctx.addEntity({
          entityKey: 'products',
          canonicalCollectionPath: 'products',
          routePrefix: '/products',
          slugField: 'slug',
          publicField: 'visibility',
          publicValue: 'public',
          pageSize: 5000,
          updatedAtField: 'updatedAt',
        })
      }
    )

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) =>
        setProductsRuntime(nuxt, {
          enabled: options.enabled ?? true,
          ...(Array.isArray(options.productKinds)
            ? { productKinds: options.productKinds }
            : {}),
        }),
      composables: (resolver) =>
        registerComposablesDirs(resolver, [
          './runtime/composables',
          './runtime/product/composables',
        ]),
      components: configureComponents,
      pages: configurePages,
      server: configureServer,
    })
  },
})
