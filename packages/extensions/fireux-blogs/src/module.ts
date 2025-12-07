import {
  defineNuxtModule,
  createResolver,
  addImportsDir,
  addComponentsDir,
} from 'nuxt/kit'
import type { Nuxt } from 'nuxt/schema'

declare module 'nuxt/schema' {
  interface NuxtConfig {
    blogs?: Partial<typeof defaults>
  }
  interface NuxtOptions {
    blogs?: Partial<typeof defaults>
  }
}

const defaults = {
  enabled: true,
}

export default defineNuxtModule({
  meta: {
    name: 'fireux-blogs',
    configKey: 'blogs',
    compatibility: { nuxt: '^4.0.0' },
  },
  defaults,
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const runtimeDir = resolver.resolve('./runtime')

    // Ensure runtime config buckets exist
    nuxt.options.runtimeConfig.blogs = nuxt.options.runtimeConfig.blogs || {}
    nuxt.options.runtimeConfig.public.blogs =
      nuxt.options.runtimeConfig.public.blogs || {}

    // Auto-import runtime composables directory (create files as needed)
    addImportsDir(resolver.resolve('./runtime/composables'))

    // Globally register blog components using their path-based names
    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      global: true,
      pathPrefix: true,
    })

    // Expose runtime directory via alias for app + Nitro contexts
    nuxt.options.alias = nuxt.options.alias || {}
    nuxt.options.alias['#fireux-blogs'] = runtimeDir

    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {}
      nitroConfig.alias['#fireux-blogs'] = runtimeDir
    })

    registerBlogPages(nuxt, resolver, runtimeDir)
  },
})

function registerBlogPages(nuxt: Nuxt, resolver: any, runtimeDir: string) {
  ensureRuntimeLayer(nuxt, runtimeDir)

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

function ensureRuntimeLayer(nuxt: Nuxt, runtimeDir: string) {
  const current = nuxt.options.extends
  if (!current) {
    nuxt.options.extends = []
  } else if (!Array.isArray(current)) {
    nuxt.options.extends = [current]
  }

  const ext = nuxt.options.extends as Array<any>
  const already = ext.some((entry) =>
    Array.isArray(entry) ? entry[0] === runtimeDir : entry === runtimeDir
  )

  if (!already) {
    ext.push([
      runtimeDir,
      {
        config: {
          srcDir: runtimeDir,
        },
      },
    ])
  }

  const options = nuxt.options as Record<string, any>
  const internalLayers: Array<
    string | { cwd?: string; src?: string; config?: Record<string, any> }
  > = (options._layers ||= [])

  const hasInternal = internalLayers.some((entry) => {
    if (typeof entry === 'string') return entry === runtimeDir
    return entry?.cwd === runtimeDir || entry?.src === runtimeDir
  })

  if (!hasInternal) {
    internalLayers.push({
      cwd: runtimeDir,
      src: runtimeDir,
      config: {
        rootDir: runtimeDir,
        srcDir: runtimeDir,
        dir: { pages: 'pages', layouts: 'layouts', middleware: 'middleware' },
      },
    })
  }
}
