import type { Nuxt } from 'nuxt/schema'
import type { Resolver } from '@nuxt/kit'

// Nuxt 4 public "extends" entry type (string or [src, { config }])
type LayerEntry = string | [string, { config?: Record<string, any> }]

export function configurePages(resolver: Resolver, nuxt: Nuxt) {
  // Core pages (dev/docs/canvas) are always layered so every tenant has the same baseline.
  // 1) Point to your module's runtime directory (must contain /pages)
  const runtimeDir = resolver.resolve('./runtime')
  if (!runtimeDir) return

  // 2) Normalize extends to an array
  const current = nuxt.options.extends
  if (!current) {
    nuxt.options.extends = []
  } else if (!Array.isArray(current)) {
    nuxt.options.extends = [current]
  }
  const ext = nuxt.options.extends as LayerEntry[]

  // 3) Skip if already present
  const already = ext.some((entry) =>
    Array.isArray(entry) ? entry[0] === runtimeDir : entry === runtimeDir
  )
  if (already) return

  // 4) Push as tuple + srcDir so Nuxt scans runtime/pages, runtime/layouts, etc.
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

  // 5) Also populate Nuxt internals for non-public APIs that still expect _layers.
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
