import {
    ensureRuntimeConfigBuckets,
    ensureRuntimeLayerFromPath,
    exposeRuntimeAlias,
} from 'fireux-core/config/module/runtime-layer'
import {
    addImportsDir,
    createResolver,
    defineNuxtModule,
} from 'nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import { configureComponents } from './config/module/components-config'
import { configureComposables } from './config/module/composables-config'
import { configureLayouts } from './config/module/layouts-config'
import { configureModels } from './config/module/models-config'
import { configurePages } from './config/module/pages-config'
import { configurePlugins } from './config/module/plugins-config'
import { configureRuntime } from './config/module/runtime-config'
import { configureServer } from './config/module/server-config'

declare module 'nuxt/schema' {
  interface NuxtConfig {
    products?: Partial<typeof defaults>
  }
  interface NuxtOptions {
    products?: Partial<typeof defaults>
  }
}

const defaults = {
  enabled: true,
}

export default defineNuxtModule({
  meta: {
    name: 'fireux-products',
    configKey: 'products',
    compatibility: { nuxt: '^4.0.0' },
  },
  defaults,
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const runtimeDir = resolver.resolve('./runtime')

    ensureRuntimeConfigBuckets(nuxt, 'products')
    configureRuntime(nuxt, 'products')
    configurePlugins(resolver)
    configureComposables(resolver)

    // Auto-import runtime composables directory (create files as needed)
    addImportsDir(resolver.resolve('./runtime/composables'))

    configureComponents(resolver)
    configureLayouts(resolver, nuxt)
    configureModels(resolver)
    configurePages(resolver, nuxt)

    exposeRuntimeAlias(nuxt, '#fireux-products', runtimeDir)

    configureServer(resolver)
    registerProductPages(nuxt, resolver, runtimeDir)
  },
})

function registerProductPages(nuxt: Nuxt, resolver: any, runtimeDir: string) {
  ensureRuntimeLayerFromPath(nuxt, runtimeDir)

  const pagesToInject = [
    {
      name: 'fireux-products-index',
      path: '/products',
      file: resolver.resolve('./runtime/pages/products/index.vue'),
    },
    {
      name: 'fireux-products-slug',
      path: '/products/:slug',
      file: resolver.resolve('./runtime/pages/products/[slug].vue'),
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
