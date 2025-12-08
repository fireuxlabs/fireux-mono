// Nuxt layer wiring for runtime pages
export function configurePages(resolver, nuxt) {
  const runtimeDir = resolver.resolve('./runtime')
  if (!runtimeDir) return

  const current = nuxt.options.extends
  if (!current) {
    nuxt.options.extends = []
  } else if (!Array.isArray(current)) {
    nuxt.options.extends = [current]
  }
  const ext = nuxt.options.extends

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

  const options = nuxt.options
  const internalLayers = (options._layers ||= [])
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
