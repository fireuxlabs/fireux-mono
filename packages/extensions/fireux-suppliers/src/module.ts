import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import type {
  FireuxSeoExtendContext,
  FireuxSeoSitemapsExtendContext,
} from 'fireux-core/config/app/seo'
import { configureRuntime } from './config/module/runtime-config'
import { configurePlugins } from './config/module/plugins-config'
import { configureComposables } from './config/module/composables-config'
import { configureComponents } from './config/module/components-config'
import { configureLayouts } from './config/module/layouts-config'
import { configureModels } from './config/module/models-config'
import { configurePages } from './config/module/pages-config'
import { configureServer } from './config/module/server-config'

export default defineNuxtModule({
  meta: {
    name: 'fireux-suppliers',
    version: '0.1.0',
    configKey: 'fireuxSuppliers',
    compatibility: { nuxt: '^4.1.0' },
  },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    registerReservedRootRouteKeys(['suppliers'])
    nuxt.hook('fireux:seo:extend' as any, (ctx: FireuxSeoExtendContext) => {
      ctx.addHub('/suppliers')
      ctx.addStaticPath('/suppliers/learn-more')
    })
    nuxt.hook('fireux:seo:sitemaps:extend' as any, (ctx: FireuxSeoSitemapsExtendContext) => {
      ctx.addEntity({
        entityKey: 'suppliers',
        canonicalCollectionPath: 'suppliers',
        routePrefix: '/suppliers',
        slugField: 'id',
        publicField: 'state',
        publicValue: 'public',
      })
      ctx.addEntity({
        entityKey: 'suppliers-official',
        canonicalCollectionPath: 'suppliers',
        routePrefix: '/suppliers',
        slugField: 'id',
        publicField: 'state',
        publicValue: 'official',
      })
    })

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) => configureRuntime(nuxt, 'drop'),
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
