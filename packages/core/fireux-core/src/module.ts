// FILE: packages/core/fireux-core/src/module.ts
import { addServerHandler, createResolver, defineNuxtModule } from '@nuxt/kit'
import {
  collectAutoSitemapPaths,
  configureSeoDefaults,
  mergeSitemapPaths,
  type FireuxSeoConfig,
} from './config/app/seo'
import { configureFireuxModule } from './config/module/module-wiring'
import { configurePlugins } from './config/module/plugins-config'
import { configureComposables } from './config/module/composables-config'
import { configureComponents } from './config/module/components-config'
import { configureLayouts } from './config/module/layouts-config'
import { configurePages } from './config/module/pages-config'
import { configureAssets } from './config/module/assets-config'

function asSeoConfig(value: unknown): FireuxSeoConfig | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  return value as FireuxSeoConfig
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => String(entry ?? '').trim())
    .filter(Boolean)
}

export default defineNuxtModule({
  meta: {
    name: 'fireux-core',
    version: '0.1.0',
  },

  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Register SEO endpoints explicitly (works locally + deployed)
    addServerHandler({
      route: '/robots.txt',
      handler: resolver.resolve('./runtime/server/robots.txt.get'),
    })
    addServerHandler({
      route: '/sitemap.xml',
      handler: resolver.resolve('./runtime/server/sitemap.xml.get'),
    })
    addServerHandler({
      route: '/sitemaps/index.xml',
      handler: resolver.resolve('./runtime/server/sitemaps/index.xml.get'),
    })
    addServerHandler({
      route: '/sitemaps/static.xml',
      handler: resolver.resolve('./runtime/server/sitemaps/static.xml.get'),
    })
    addServerHandler({
      route: '/sitemaps/:entityPage.xml',
      handler: resolver.resolve('./runtime/server/sitemaps/[entity]-[page].xml.get'),
    })
    addServerHandler({
      route: '/api/public/users',
      handler: resolver.resolve('./runtime/server/api/public/users.get'),
    })
    addServerHandler({
      route: '/api/public/users/:handle',
      handler: resolver.resolve('./runtime/server/api/public/users/[handle].get'),
    })

    nuxt.hook('fireux:seo:sitemaps:extend' as any, (ctx: any) => {
      ctx?.addEntity?.({
        entityKey: 'users',
        indexCollectionPath: 'seo_index_users',
        canonicalCollectionPath: 'users',
        routePrefix: '/users',
        slugField: 'handle',
        publicField: '',
        pageSize: 5000,
        updatedAtField: 'updatedAt',
      })
    })

    nuxt.hook('modules:done', async () => {
      const runtimeConfig = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
      const pub = (runtimeConfig.public ||= {}) as Record<string, any>
      const fireux = (pub.fireux ||= {}) as Record<string, any>
      const privateFireux = ((runtimeConfig.fireux ||= {}) as Record<string, any>)

      const appName =
        typeof fireux.name === 'string' && fireux.name.trim()
          ? fireux.name.trim()
          : 'FireUX'
      const domain =
        typeof fireux.domain === 'string' ? fireux.domain.trim() : ''

      const resolved = await configureSeoDefaults(nuxt, {
        appName,
        domain,
        seo: asSeoConfig(privateFireux.seo),
      })

      if (!fireux.siteUrl && resolved.siteUrl) {
        fireux.siteUrl = resolved.siteUrl
      }
    })

    nuxt.hook('pages:resolved', (pages: any[]) => {
      const runtimeConfig = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
      const pub = (runtimeConfig.public ||= {}) as Record<string, any>
      const fireux = (pub.fireux ||= {}) as Record<string, any>
      const seo = ((fireux.seo ||= {}) as Record<string, any>)

      const autoPaths = collectAutoSitemapPaths(pages, {
        disallowPaths: toStringArray(seo.disallow),
        noindexPaths: toStringArray(seo.noindexPaths),
      })

      seo.sitemapPaths = mergeSitemapPaths(seo.sitemapPaths, autoPaths)
    })

    configureFireuxModule(resolver, nuxt, {
      plugins: configurePlugins,
      composables: configureComposables,
      components: configureComponents,
      layouts: configureLayouts,
      pages: configurePages,
      assets: configureAssets,
    })
  },
})
