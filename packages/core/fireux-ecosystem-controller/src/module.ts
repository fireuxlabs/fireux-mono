import { defineNuxtModule, createResolver, addImportsDir } from 'nuxt/kit'

// Nuxt 4 public "extends" entry type (string or [src, { config }])
type LayerEntry = string | [string, { config?: Record<string, any> }]

function configurePages(resolver: ReturnType<typeof createResolver>, nuxt: any) {
  const runtimeDir = resolver.resolve('./runtime')
  if (!runtimeDir) return

  const current = nuxt.options.extends
  if (!current) {
    nuxt.options.extends = []
  } else if (!Array.isArray(current)) {
    nuxt.options.extends = [current]
  }
  const ext = nuxt.options.extends as LayerEntry[]

  const already = ext.some((entry) =>
    Array.isArray(entry) ? entry[0] === runtimeDir : entry === runtimeDir
  )
  if (already) return

  ext.push([
    runtimeDir,
    {
      config: {
        srcDir: runtimeDir,
      },
    },
  ])

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

declare module 'nuxt/schema' {
  interface NuxtConfig {
    ecosystemController?: Partial<typeof defaults>
  }
  interface NuxtOptions {
    ecosystemController?: Partial<typeof defaults>
  }
}

const defaults = {
  enabled: true,
}

export default defineNuxtModule({
  meta: {
    name: 'fireux-ecosystem-controller',
    configKey: 'ecosystemController',
    compatibility: { nuxt: '^4.0.0' },
  },
  defaults,
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Ensure runtime config buckets exist
    nuxt.options.runtimeConfig.ecosystemController =
      nuxt.options.runtimeConfig.ecosystemController || {}
    nuxt.options.runtimeConfig.public.ecosystemController =
      nuxt.options.runtimeConfig.public.ecosystemController || {}

    // Auto-import runtime composables directory (create files as needed)
    addImportsDir(resolver.resolve('./runtime/composables'))

    // Layer runtime pages (e.g., /apps)
    configurePages(resolver, nuxt)

    // Example: expose runtime directory via alias for server routes/plugins
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {}
      nitroConfig.alias['#fireux-ecosystem-controller'] =
        resolver.resolve('./runtime')
    })
  },
})
