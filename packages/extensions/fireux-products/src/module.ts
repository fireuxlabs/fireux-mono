import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { registerComposablesDirs } from 'fireux-core/config/module/module-helpers'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import type {
  FireuxSeoExtendContext,
  FireuxSeoSitemapsExtendContext,
} from 'fireux-core/config/app/seo-config'
import { configureComponents } from './config/module/components-config.ts'
import { requireNativeRuntimeLayer } from 'fireux-core/config/module/runtime-layer'

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
    registerReservedRootRouteKeys(nuxt, ['products'])
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

    setProductsRuntime(nuxt, {
      enabled: options.enabled ?? true,
      ...(Array.isArray(options.productKinds)
        ? { productKinds: options.productKinds }
        : {}),
    })
    registerComposablesDirs(resolver, ['./runtime/product/composables'])
    configureComponents(resolver)
    requireNativeRuntimeLayer(resolver, nuxt)
  },
})
