import {
  defineNuxtModule,
  createResolver,
  addImportsDir,
  addComponentsDir,
} from 'nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import { configureServer } from './config/server-config'
import {
  ensureRuntimeConfigBuckets,
  ensureRuntimeLayer,
  exposeRuntimeAlias,
} from 'fireux-core/config/nuxt/nuxt-runtime-layer'

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

    // Auto-import runtime composables directory (create files as needed)
    addImportsDir(resolver.resolve('./runtime/composables'))

    // Globally register product components using their path-based names
    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      global: true,
      pathPrefix: true,
    })

    exposeRuntimeAlias(nuxt, '#fireux-products', runtimeDir)

    configureServer(resolver)
    registerProductPages(nuxt, resolver, runtimeDir)
  },
})

function registerProductPages(nuxt: Nuxt, resolver: any, runtimeDir: string) {
  ensureRuntimeLayer(nuxt, runtimeDir)

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
