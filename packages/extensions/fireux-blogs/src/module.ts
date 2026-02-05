import {
  ensureRuntimeConfigBuckets,
  exposeRuntimeAlias,
} from 'fireux-core/config/module/runtime-layer'
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { configureComponents } from './config/module/components-config'
import { configureComposables } from './config/module/composables-config'
import { configureLayouts } from './config/module/layouts-config'
import { configureModels } from './config/module/models-config'
import { configurePages } from './config/module/pages-config'
import { configurePlugins } from './config/module/plugins-config'
import { configureRuntime } from './config/module/runtime-config'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    /** @deprecated Use `fireuxBlogs` */
    blogs?: Partial<typeof defaults>
    fireuxBlogs?: Partial<typeof defaults>
  }
  interface NuxtOptions {
    /** @deprecated Use `fireuxBlogs` */
    blogs?: Partial<typeof defaults>
    fireuxBlogs?: Partial<typeof defaults>
  }
}

const defaults = {
  enabled: true,
}

export default defineNuxtModule({
  meta: {
    name: 'fireux-blogs',
    version: '0.1.0',
    configKey: 'fireuxBlogs',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults,
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const runtimeDir = resolver.resolve('./runtime')

    ensureRuntimeConfigBuckets(nuxt, 'blogs')
    configureRuntime(nuxt, 'blogs')
    configurePlugins(resolver)
    configureComposables(resolver)

    configureComponents(resolver)
    configureLayouts(resolver, nuxt)
    configureModels(resolver)
    configurePages(resolver, nuxt)

    exposeRuntimeAlias(nuxt, '#fireux-blogs', runtimeDir)

    registerBlogPages(nuxt, resolver)
  },
})

function registerBlogPages(nuxt: Nuxt, resolver: any) {
  const pagesToInject = [
    {
      name: 'fireux-blog-index',
      path: '/blog',
      file: resolver.resolve('./runtime/pages/blog/index.vue'),
    },
    {
      name: 'fireux-blog-slug',
      path: '/blog/:slug',
      file: resolver.resolve('./runtime/pages/blog/[slug].vue'),
    },
  ]

  nuxt.hook('pages:extend', (pages: any[]) => {
    for (const entry of pagesToInject) {
      const exists = pages.some((page) => page.path === entry.path)
      if (!exists) {
        pages.push(entry)
      }
    }
  })
}
