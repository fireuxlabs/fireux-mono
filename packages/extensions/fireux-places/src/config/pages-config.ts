import type { Nuxt, NuxtPage } from 'nuxt/schema'
import type { Resolver } from '@nuxt/kit'

interface PageEntry {
  name: string
  path: string
  file: string
}

// Nuxt 4 public "extends" entry type (string or [src, { config }])
type LayerEntry = string | [string, { config?: Record<string, any> }]

export function configurePages(resolver: Resolver, nuxt: Nuxt) {
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

  if (!already) {
    ext.push([
      runtimeDir,
      {
        config: {
          srcDir: runtimeDir,
          // optional, explicit directories if you deviate from defaults:
          // dir: { pages: 'pages', layouts: 'layouts', middleware: 'middleware' },
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

  const pagesToInject: PageEntry[] = [
    {
      name: 'places',
      path: '/places',
      file: resolver.resolve('./runtime/pages/places/index.vue'),
    },
  ]

  nuxt.hook('pages:extend', (pages: NuxtPage[]) => {
    for (const entry of pagesToInject) {
      const exists = pages.some((page) => page.path === entry.path)
      if (!exists) {
        pages.push({
          name: entry.name,
          path: entry.path,
          file: entry.file,
        })
      }
    }
  })
}
