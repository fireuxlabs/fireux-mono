// Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: publish category and workplace configuration.
// Concurrent edit — 2026-07-21 12:53 CEST — Job Directory: retire visibility-only raw-root sitemap discovery.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: reserve App configuration for category deltas only.
// Concurrent edit — 2026-07-22 12:56 CEST — Job category scope: publish explicit all-versus-allowlist runtime authority.
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import {
  defaultFireuxJobsConfig,
  type FireuxJobCategorySelection,
} from './config/jobs.config'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { registerComposablesDirs } from 'fireux-core/config/module/module-helpers'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import { configureRuntimeDefaults } from 'fireux-core/config/module/runtime-config'
import type {
  FireuxSeoExtendContext,
  FireuxSeoSitemapsExtendContext,
} from 'fireux-core/config/app/seo'
import { configureComponents } from './config/module/components-config'
import { configurePages } from './config/module/pages-config'
import { configureAssets } from './config/module/assets-config'
import { configureServer } from './config/module/server-config'

export interface ModuleOptions {
  prefix?: string
  categories?: FireuxJobCategorySelection
}

function normalizeIdentifiers(
  value: unknown,
  fallback: string[] = []
): string[] {
  const source = Array.isArray(value) ? value : fallback
  return Array.from(
    new Set(source.map((entry) => String(entry ?? '').trim()).filter(Boolean))
  )
}

function appCapabilities(nuxt: any) {
  const fireux = nuxt.options.runtimeConfig?.public?.fireux || {}
  const domains = new Set(normalizeIdentifiers(fireux.domains))
  const profiles = new Set(normalizeIdentifiers(fireux.profiles))
  return {
    jobs: domains.has('jobs'),
    agents: profiles.has('agent'),
    professionals: profiles.has('professional'),
  }
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fireuxJobs?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    fireuxJobs?: Partial<ModuleOptions>
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-jobs',
    version: '0.1.0',
    configKey: 'fireuxJobs',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: { prefix: 'Fire' },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const capabilities = appCapabilities(nuxt)
    registerReservedRootRouteKeys([
      ...(capabilities.jobs ? ['jobs'] : []),
      ...(capabilities.agents ? ['agents'] : []),
      ...(capabilities.professionals ? ['professionals'] : []),
    ])
    nuxt.hook('fireux:seo:extend' as any, (ctx: FireuxSeoExtendContext) => {
      if (capabilities.jobs) {
        ctx.addHub('/jobs')
        ctx.addStaticPath('/jobs/learn-more')
      }
      if (capabilities.agents) {
        ctx.addHub('/agents')
        ctx.addStaticPath('/agents/learn-more')
      }
      if (capabilities.professionals) {
        ctx.addHub('/professionals')
        ctx.addStaticPath('/professionals/learn-more')
      }
    })
    nuxt.hook(
      'fireux:seo:sitemaps:extend' as any,
      (ctx: FireuxSeoSitemapsExtendContext) => {
        if (capabilities.jobs) ctx.addDocument('/sitemaps/jobs.xml')
      }
    )
    const categoryScope = options?.categories === 'all' ? 'all' : 'allowlist'
    const categories = normalizeIdentifiers(
      categoryScope === 'allowlist' ? options?.categories : [],
      defaultFireuxJobsConfig.categories
    )
    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) =>
        configureRuntimeDefaults(
          nuxt,
          'jobs',
          {
            enabled: true,
            categoryScope,
            categories,
          },
          { merge: true }
        ),
      composables: (resolver) =>
        registerComposablesDirs(resolver, [
          './runtime/composables',
          './runtime/job/composables',
          './runtime/user/composables',
        ]),
      components: configureComponents,
      pages: (resolver, nuxt) => configurePages(resolver, nuxt, capabilities),
      assets: configureAssets,
      server: configureServer,
    })
  },
})
