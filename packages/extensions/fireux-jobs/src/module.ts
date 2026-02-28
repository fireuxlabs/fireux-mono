import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { defaultFireuxJobsConfig } from './config/jobs.config'
import { configureRuntime } from './config/module/runtime-config'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { registerReservedRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import type { FireuxSeoExtendContext } from 'fireux-core/config/app/seo'
import type { FireuxSeoSitemapsExtendContext } from 'fireux-core/config/app/seo'
import { configurePlugins } from './config/module/plugins-config'
import { configureComposables } from './config/module/composables-config'
import { configureComponents } from './config/module/components-config'
import { configureLayouts } from './config/module/layouts-config'
import { configurePages } from './config/module/pages-config'
import { configureServer } from './config/module/server-config'

export interface ModuleOptions {
  prefix?: string
  workplaces?: string[]
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
    registerReservedRouteKeys(['jobs', 'agents', 'professionals'])
    nuxt.hook('fireux:seo:extend' as any, (ctx: FireuxSeoExtendContext) => {
      ctx.addHub('/jobs')
      ctx.addHub('/agents')
      ctx.addHub('/professionals')
      ctx.addStaticPath('/jobs/learn-more')
      ctx.addStaticPath('/agents/learn-more')
      ctx.addStaticPath('/professionals/learn-more')
    })
    nuxt.hook('fireux:seo:sitemaps:extend' as any, (ctx: FireuxSeoSitemapsExtendContext) => {
      ctx.addEntity({
        entityKey: 'jobs',
        indexCollectionPath: 'seo_index_jobs',
      })
      ctx.addEntity({
        entityKey: 'agents',
        indexCollectionPath: 'seo_index_agents',
      })
      ctx.addEntity({
        entityKey: 'professionals',
        indexCollectionPath: 'seo_index_professionals',
      })
    })
    const workplaces = Array.isArray(options?.workplaces)
      ? options.workplaces
      : defaultFireuxJobsConfig.workplaces
    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) =>
        configureRuntime(nuxt, 'jobs', {
          enabled: true,
          workplaces,
        }),
      plugins: configurePlugins,
      composables: configureComposables,
      components: configureComponents,
      layouts: configureLayouts,
      pages: configurePages,
      server: configureServer,
    })
  },
})
