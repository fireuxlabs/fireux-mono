import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import type { FireuxSeoExtendContext } from 'fireux-core/config/app/seo'
import { configurePlugins } from './config/module/plugins-config'
import { configureComposables } from './config/module/composables-config'
import { configureComponents } from './config/module/components-config'
import { configureLayouts } from './config/module/layouts-config'
import { configureModels } from './config/module/models-config'
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
    fireux.products && typeof fireux.products === 'object' && !Array.isArray(fireux.products)
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

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) =>
        setProductsRuntime(nuxt, {
          enabled: options.enabled ?? true,
          ...(Array.isArray(options.productKinds)
            ? { productKinds: options.productKinds }
            : {}),
        }),
      plugins: configurePlugins,
      composables: configureComposables,
      components: configureComponents,
      layouts: configureLayouts,
      models: configureModels,
      pages: configurePages,
      server: configureServer,
    })
  },
})
