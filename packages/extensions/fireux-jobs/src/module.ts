// Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: publish category and workplace configuration.
// Concurrent edit — 2026-07-21 12:53 CEST — Public Jobs projection: retire visibility-only raw-root sitemap discovery.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: reserve App configuration for category deltas only.
// Concurrent edit — 2026-07-22 12:56 CEST — Job category scope: publish explicit all-versus-allowlist runtime authority.
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import {
  defaultFireuxJobsConfig,
  normalizeFireuxJobSourceAppDoorways,
  type FireuxJobCategorySelection,
  type FireuxJobSourceAppDoorways,
} from './config/jobs.config'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { registerComposablesDir } from 'fireux-core/config/module/module-helpers'
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
  sourceAppDoorways?: FireuxJobSourceAppDoorways
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
    registerReservedRootRouteKeys(['jobs', 'agents', 'professionals'])
    nuxt.hook('fireux:seo:extend' as any, (ctx: FireuxSeoExtendContext) => {
      ctx.addHub('/jobs')
      ctx.addHub('/agents')
      ctx.addHub('/professionals')
      ctx.addStaticPath('/jobs/learn-more')
      ctx.addStaticPath('/agents/learn-more')
      ctx.addStaticPath('/professionals/learn-more')
    })
    nuxt.hook(
      'fireux:seo:sitemaps:extend' as any,
      (ctx: FireuxSeoSitemapsExtendContext) => {
        ctx.addDocument('/sitemaps/jobs.xml')
      }
    )
    const categoryScope = options?.categories === 'all' ? 'all' : 'allowlist'
    const categories = normalizeIdentifiers(
      categoryScope === 'allowlist' ? options?.categories : [],
      defaultFireuxJobsConfig.categories
    )
    const sourceAppDoorways = normalizeFireuxJobSourceAppDoorways(
      options?.sourceAppDoorways
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
            sourceAppDoorways,
          },
          { merge: true }
        ),
      composables: registerComposablesDir,
      components: configureComponents,
      pages: configurePages,
      assets: configureAssets,
      server: configureServer,
    })
  },
})
