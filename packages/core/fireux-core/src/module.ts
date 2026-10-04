// FILE: packages/core/fireux-core/src/module.ts
// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: register the authenticated runtime App membership endpoint.
// Concurrent edit — 2026-07-20 12:59 CEST — Account consent slice: register trusted UserAccount provisioning.
// User handle updates use the trusted canonical User endpoint.
// Concurrent edit — 2026-07-20 16:25 CEST — Repo Efficiency Pass 1 of 6: register narrow public status and keep authenticated dev surfaces client-only.
// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: register exact public identity and App-admin people endpoints.
import { defaultMaxListeners, setMaxListeners } from 'node:events'
import { addServerHandler, createResolver, defineNuxtModule } from '@nuxt/kit'
import {
  collectAutoSitemapPaths,
  configureSeoDefaults,
  mergeSitemapPaths,
  type FireuxSeoConfig,
} from './config/app/seo'
import { configureFireuxModule } from './config/module/module-wiring'
import { registerComposablesDirs } from './config/module/module-helpers'
import { configureComponents } from './config/module/components-config'
import { configureWorkspacePageTransitions } from './config/module/pages-config'
import { configureAssets } from './config/module/assets-config'

const DEV_RESPONSE_MAX_LISTENERS = 32

function asSeoConfig(value: unknown): FireuxSeoConfig | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return undefined
  return value as FireuxSeoConfig
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => String(entry ?? '').trim()).filter(Boolean)
}

export default defineNuxtModule({
  meta: {
    name: 'fireux-core',
    version: '0.1.0',
  },

  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    if (nuxt.options.dev) {
      if (defaultMaxListeners < DEV_RESPONSE_MAX_LISTENERS) {
        setMaxListeners(DEV_RESPONSE_MAX_LISTENERS)
      }

      type NuxtOptionsWithRouteRules = typeof nuxt.options & {
        routeRules?: Record<string, { ssr?: boolean }>
      }
      const options = nuxt.options as NuxtOptionsWithRouteRules
      const routeRules = (options.routeRules ||= {})
      routeRules['/dev'] = { ...routeRules['/dev'], ssr: false }
      routeRules['/dev/**'] = { ...routeRules['/dev/**'], ssr: false }
    }

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
      handler: resolver.resolve(
        './runtime/server/sitemaps/[entity]-[page].xml.get'
      ),
    })
    addServerHandler({
      route: '/manifest.webmanifest',
      method: 'get',
      handler: resolver.resolve('./runtime/server/manifest.webmanifest.get'),
    })
    nuxt.hook('fireux:seo:sitemaps:extend' as any, (ctx: any) => {
      ctx?.addEntity?.({
        entityKey: 'users',
        canonicalCollectionPath: 'users',
        routePrefix: '/users',
        slugField: 'handle',
        publicField: '',
        pageSize: 5000,
        updatedAtField: 'updatedAt',
      })
    })

    nuxt.hook('modules:done', async () => {
      const runtimeConfig = ((nuxt.options as any).runtimeConfig ||=
        {}) as Record<string, any>
      const pub = (runtimeConfig.public ||= {}) as Record<string, any>
      const fireux = (pub.fireux ||= {}) as Record<string, any>
      const privateFireux = (runtimeConfig.fireux ||= {}) as Record<string, any>

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
      const runtimeConfig = ((nuxt.options as any).runtimeConfig ||=
        {}) as Record<string, any>
      const pub = (runtimeConfig.public ||= {}) as Record<string, any>
      const fireux = (pub.fireux ||= {}) as Record<string, any>
      const seo = (fireux.seo ||= {}) as Record<string, any>

      const autoPaths = collectAutoSitemapPaths(pages, {
        disallowPaths: toStringArray(seo.disallow),
        noindexPaths: toStringArray(seo.noindexPaths),
      })

      seo.sitemapPaths = mergeSitemapPaths(seo.sitemapPaths, autoPaths)
    })

    configureWorkspacePageTransitions(nuxt)

    configureFireuxModule(resolver, nuxt, {
      composables: (resolver) =>
        registerComposablesDirs(resolver, [
          './runtime/composables',
          './runtime/app/composables',
          './runtime/app/composables/identity',
          './runtime/app/composables/featured',
          './runtime/app/composables/membership',
          './runtime/app/composables/initialization',
          './runtime/app/composables/brand',
          './runtime/app/composables/config',
          './runtime/app/composables/pricing',
          './runtime/ecosystem/composables',
          './runtime/user/composables',
          './runtime/user/composables/account',
          './runtime/user/composables/directory',
          './runtime/user/composables/identity',
          './runtime/user/composables/notifications',
          './runtime/user/composables/profile',
          './runtime/user/composables/session',
        ]),
      components: configureComponents,
      assets: configureAssets,
    })
  },
})
