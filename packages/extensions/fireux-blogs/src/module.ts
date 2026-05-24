import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import type {
  FireuxSeoExtendContext,
  FireuxSeoSitemapsExtendContext,
} from 'fireux-core/config/app/seo'
import { configurePlugins } from './config/module/plugins-config'
import { configureComposables } from './config/module/composables-config'
import { configureComponents } from './config/module/components-config'
import { configureLayouts } from './config/module/layouts-config'
import { configureModels } from './config/module/models-config'
import { configurePages } from './config/module/pages-config'
import { configureServer } from './config/module/server-config'

export type FireuxBlogsModuleOptions = {
  enabled?: boolean
}

function setBlogsRuntime(nuxt: any, overrides: Record<string, any>) {
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const pub = (rc.public ||= {}) as Record<string, any>
  const fireux = (pub.fireux ||= {}) as Record<string, any>
  const current =
    fireux.blogs && typeof fireux.blogs === 'object' && !Array.isArray(fireux.blogs)
      ? fireux.blogs
      : {}
  fireux.blogs = { ...current, ...overrides }
}

export default defineNuxtModule({
  meta: {
    name: 'fireux-blogs',
    version: '0.1.0',
    configKey: 'fireuxBlogs',
    compatibility: { nuxt: '^4.1.0' },
  },
  setup(options: FireuxBlogsModuleOptions = {}, nuxt) {
    const resolver = createResolver(import.meta.url)
    nuxt.hook('fireux:seo:extend' as any, (ctx: FireuxSeoExtendContext) => {
      ctx.addHub('/blog')
    })
    nuxt.hook('fireux:seo:sitemaps:extend' as any, (ctx: FireuxSeoSitemapsExtendContext) => {
      ctx.addEntity({
        entityKey: 'blogs',
        canonicalCollectionPath: 'blogs',
        routePrefix: '/blog',
        slugField: 'slug',
        publicField: 'visibility',
        publicValue: 'public',
        pageSize: 5000,
        updatedAtField: 'updatedAt',
      })
    })

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) =>
        setBlogsRuntime(nuxt, {
          enabled: options.enabled ?? true,
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
