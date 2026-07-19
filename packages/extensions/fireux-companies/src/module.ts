import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
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

export interface ModuleOptions {
  prefix?: string
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fireuxCompanies?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    fireuxCompanies?: Partial<ModuleOptions>
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-companies',
    version: '2.0.0',
    configKey: 'fireuxCompanies',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: { prefix: 'Fire' },
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    nuxt.hook('fireux:seo:extend' as any, (ctx: FireuxSeoExtendContext) => {
      ctx.addHub('/companies')
      ctx.addStaticPath('/companies/learn-more')
    })
    nuxt.hook('fireux:seo:sitemaps:extend' as any, (ctx: FireuxSeoSitemapsExtendContext) => {
      ctx.addEntity({
        entityKey: 'companies',
        canonicalCollectionPath: 'companies',
        routePrefix: '/companies',
        slugField: 'id',
        publicField: 'verified',
        publicValue: true,
      })
    })

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) => configureRuntime(nuxt, 'companies'),
      composables: configureComposables,
      components: configureComponents,
      layouts: configureLayouts,
      pages: configurePages,
      server: configureServer,
    })
  },
})
