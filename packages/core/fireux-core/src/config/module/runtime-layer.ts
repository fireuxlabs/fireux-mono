import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'

export function ensureRuntimeLayerFromPath(nuxt: Nuxt, runtimeDir: string) {
  if (!runtimeDir) return null

  // Module setup runs after Nuxt has resolved config-time `extends`.
  // This internal insertion remains until package runtimes become declarative layers.
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
