import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'

type RuntimeConfigRoot = Record<string, any>
type PublicRuntimeConfig = Record<string, any>

// Nuxt 4 public "extends" entry type (string or [src, { config }])
type LayerEntry = string | [string, { config?: Record<string, any> }]

export function ensureRuntimeConfigBuckets(nuxt: Nuxt, key: string) {
  if (!key) return
  const rc = (nuxt.options.runtimeConfig as unknown as RuntimeConfigRoot) ||
    ((nuxt.options.runtimeConfig = {} as any) as RuntimeConfigRoot)

  rc[key] ||= {}

  const pub = ((rc.public ||= {}) as PublicRuntimeConfig)
  pub[key] ||= {}
}

export function exposeRuntimeAlias(
  nuxt: Nuxt,
  aliasKey: string,
  runtimeDir: string
) {
  if (!aliasKey || !runtimeDir) return

  nuxt.options.alias ||= {}
  nuxt.options.alias[aliasKey] = runtimeDir

  nuxt.hook('nitro:config', (nitroConfig: any) => {
    nitroConfig.alias ||= {}
    nitroConfig.alias[aliasKey] = runtimeDir
  })
}

export function ensureRuntimeLayerFromPath(nuxt: Nuxt, runtimeDir: string) {
  if (!runtimeDir) return null

  const currentLayers = (nuxt.options as any).layers
  if (!currentLayers) {
    ;(nuxt.options as any).layers = [runtimeDir]
  } else if (Array.isArray(currentLayers)) {
    if (!currentLayers.includes(runtimeDir)) currentLayers.push(runtimeDir)
  } else if (typeof currentLayers === 'string') {
    if (currentLayers !== runtimeDir) {
      ;(nuxt.options as any).layers = [currentLayers, runtimeDir]
    }
  }

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
          rootDir: runtimeDir,
          srcDir: runtimeDir,
          dir: { pages: 'pages', layouts: 'layouts', middleware: 'middleware' },
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

  return runtimeDir
}

export function ensureRuntimeLayer(resolver: Resolver, nuxt: Nuxt) {
  const runtimeDir = resolver.resolve('./runtime')
  if (!runtimeDir) return null
  return ensureRuntimeLayerFromPath(nuxt, runtimeDir)
}
