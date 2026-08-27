import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { registerComposablesDirs } from 'fireux-core/config/module/module-helpers'
import type {
  FireuxSeoExtendContext,
  FireuxSeoSitemapsExtendContext,
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
    nuxt.hook(
      'fireux:seo:sitemaps:extend' as any,
      (ctx: FireuxSeoSitemapsExtendContext) => {
        ctx.addEntity({
          entityKey: 'companies',
          canonicalCollectionPath: 'companies',
          routePrefix: '/companies',
          routeIdentity: 'document-id',
          publicField: 'verified',
          publicValue: true,
        })
      }
    )

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) =>
        configureRuntimeDefaults(
          nuxt,
          'companies',
          { enabled: true },
          { merge: true }
        ),
      composables: (resolver) =>
        registerComposablesDirs(resolver, [
          './runtime/place/composables',
        ]),
      components: configureComponents,
      pages: configurePages,
      server: configureServer,
    })
  },
})
